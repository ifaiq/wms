import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { attachReferenceNumber } from 'src/common';
import { openSearchIndexKey } from 'src/common/constants';

@Injectable()
export class OpensearchService {
  private readonly logger = new Logger(OpensearchService.name);
  client: Client;
  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  createIndex = async (index: string) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      return indexExists;
    }
    return await this.client.indices.create({
      index
    });
  };

  addDocumentById = async (
    index: string,
    body: any,
    uniqueIdentifierKey = openSearchIndexKey.id
  ) => {
    body = attachReferenceNumber(index, body);
    return await this.client.index({
      index,
      id: String(body[uniqueIdentifierKey]),
      body: { ...body, id: String(body.id) },
      refresh: true
    });
  };

  updateDocumentById = async (
    index: string,
    body: any,
    uniqueIdentifierKey = openSearchIndexKey.id
  ) => {
    body = attachReferenceNumber(index, body);
    return await this.client.update({
      index,
      id: String(body[uniqueIdentifierKey]),
      body: { doc: { ...body, id: String(body.id) } },
      refresh: true
    });
  };

  deleteDocumentById = async (index: string, id: string) => {
    return await this.client.delete({
      index,
      id,
      refresh: true
    });
  };

  addInBulk = async (
    index: string,
    data: any[],
    uniqueIdentifierKey = openSearchIndexKey.id
  ) => {
    const context = `addInBulk()`;
    if (data.length) {
      const exists = await this.client.indices.exists({ index });
      exists.body && (await this.deleteIndex(index));
      await this.client.indices.create({
        index
      });
      const body = data.flatMap((doc) => {
        doc = attachReferenceNumber(index, doc);
        return [
          { index: { _index: index, _id: doc[uniqueIdentifierKey] } },
          { ...doc, id: String(doc.id) }
        ];
      });
      if (body.length) {
        const OPENSEARCH_BULK_DOCUMENT_SIZE = 16;
        const numOfIterations = Math.ceil(
          body.length / OPENSEARCH_BULK_DOCUMENT_SIZE
        );
        this.logger.log(
          `context: ${context}, index: ${index}, numOfIterations: ${numOfIterations}, bodyLength: ${body.length} }`
        );
        for (let iteration = 0; iteration < numOfIterations; iteration++) {
          await new Promise((resolve) =>
            setTimeout(async () => {
              const sliceStart = iteration * OPENSEARCH_BULK_DOCUMENT_SIZE;
              const sliceEnd = (iteration + 1) * OPENSEARCH_BULK_DOCUMENT_SIZE;
              const slicedBody = body.slice(sliceStart, sliceEnd);
              const bulkresponse = await this.client.bulk({
                refresh: true,
                body: slicedBody,
                error_trace: true,
                human: true,
                pretty: true,
                timeout: '2m'
              });
              console.log(
                `statusCode: ${bulkresponse.statusCode}, body: ${JSON.stringify(
                  {
                    ...bulkresponse.body,
                    items: bulkresponse.body.items.length
                  }
                )}, header: ${JSON.stringify(bulkresponse.headers)}`
              );
              resolve(true);
            }, 1000)
          );
        }
      }
    }
  };

  deleteIndex = async (index: string) => {
    return await this.client.indices.delete({
      index
    });
  };

  searchVendors = async (filters: any, search: any, index: string) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      const { skip, take, ...searchParmas } = search;
      // Only sort if searchParams are empty
      const sortOnCreateDate =
        !Object.values(searchParmas).filter(Boolean).length;
      const query = this.makeQuery(
        filters,
        searchParmas,
        { skip, take },
        sortOnCreateDate
      );
      const response = (
        await this.client.search({
          index,
          body: query
        })
      ).body.hits;
      return this.filterData(response, index);
    }
    return {
      vendors: [],
      total: 0
    };
  };

  searchLocations = async (filters: any, search: any, index: string) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      const { skip, take, ...searchParmas } = search;
      // Only sort if searchParams are empty
      const sortOnCreateDate =
        !Object.values(searchParmas).filter(Boolean).length;
      const query = this.makeQuery(
        filters,
        searchParmas,
        { skip, take },
        sortOnCreateDate
      );
      const response = (
        await this.client.search({
          index,
          body: query
        })
      ).body.hits;
      return this.filterData(response, index);
    }
    return {
      locations: [],
      total: 0
    };
  };

  searchUsers = async (search: any, index: string) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      const { skip, take, ...searchParmas } = search;
      // Only sort if searchParams are empty
      const sortOnCreateDate =
        !Object.values(searchParmas).filter(Boolean).length;
      const query = this.makeQuery(
        {},
        searchParmas,
        { skip, take },
        sortOnCreateDate
      );
      const response = (
        await this.client.search({
          index,
          body: query
        })
      ).body.hits;
      return this.filterData(response, index);
    }
    return {
      users: [],
      total: 0
    };
  };

  searchPurchaseOrders = async (
    filters: any,
    search: any,
    nestedSearch: any,
    date: any,
    index: string
  ) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      const { id, skip, take } = search;
      const performNestedSearch =
        !!Object.values(nestedSearch).filter(Boolean).length;
      // Only sort if searchParams are empty
      const sortOnCreateDate = !id && !performNestedSearch;
      const query = this.makeQuery(
        filters,
        {
          referenceNumber: id
        },
        { skip, take },
        sortOnCreateDate
      );
      const { from, till } = date;

      query.query.bool.filter.push({
        range: {
          createdAt: {
            gte: from,
            lte: till
          }
        }
      });
      if (performNestedSearch) {
        this.makePurchaseOrderNestedQuery(query, nestedSearch);
      }
      const response = (
        await this.client.search({
          index,
          body: query
        })
      ).body.hits;
      return this.filterData(response, index);
    }
    return {
      purchaseorders: [],
      total: 0
    };
  };

  searchTransfers = async (
    filters: any,
    search: any,
    nestedSearch: any,
    date: any,
    index: string
  ) => {
    const indexExists = await this.checkIfIndexExists(index);
    if (indexExists) {
      const { id, skip, take } = search;
      const performNestedSearch =
        !!Object.values(nestedSearch).filter(Boolean).length;
      // Only sort if searchParams are empty
      const sortOnCreateDate = !id && !performNestedSearch;
      const query = this.makeQuery(
        filters,
        {
          referenceNumber:
            id?.length !== 0 ? this.updateReferfenceNumberParam(id) : null
        },
        { skip, take },
        sortOnCreateDate
      );
      const { from, till } = date;

      query.query.bool.filter.push({
        range: {
          createdAt: {
            gte: from,
            lte: till
          }
        }
      });
      if (performNestedSearch) {
        this.makeTransferNestedQuery(query, nestedSearch);
      }
      const response = (
        await this.client.search({
          index,
          body: query
        })
      ).body.hits;
      return this.filterData(response, index);
    }
    return {
      transfers: [],
      total: 0
    };
  };

  private makeQuery = (
    filters: any,
    search: any,
    pagination = { skip: 0, take: null },
    sortOnCreateDate = false
  ) => {
    const query: any = {
      from: pagination.skip,
      size: pagination.take,
      query: {
        bool: {
          must: [],
          filter: []
        }
      }
    };
    for (const [key, value] of Object.entries(search)) {
      if (value) {
        if ((value as Array<string>).length > 1) {
          query.query.bool.must.splice(0, 0, { bool: { should: [] } });
          (value as Array<string>).forEach((item) => {
            query.query.bool.must[0].bool.should.push({
              query_string: {
                query: ['id', 'referenceNumber'].includes(key)
                  ? item
                  : `*${item}*`,
                fields: [
                  ['email', 'phone', 'taxID', 'referenceNumber'].includes(key)
                    ? `${key}.keyword`
                    : key
                ]
              }
            });
          });
        } else {
          const stringifiedValue = (value as Array<string>).toString();
          if (stringifiedValue) {
            query.query.bool.must.push({
              query_string: {
                query: ['id', 'referenceNumber'].includes(key)
                  ? stringifiedValue
                  : `*${stringifiedValue}*`,
                fields: [
                  ['email', 'phone', 'taxID', 'referenceNumber'].includes(key)
                    ? `${key}.keyword`
                    : key
                ]
              }
            });
          }
        }
      }
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        query.query.bool.filter.push({ match: { [key]: value } });
      }
    }
    if (sortOnCreateDate) {
      query.sort = {
        createdAt: { order: 'desc' }
      };
    }
    return query;
  };

  private makePurchaseOrderNestedQuery = (query: any, nestedSearch: any) => {
    for (const [key, value] of Object.entries(nestedSearch)) {
      if (value) {
        if ((value as Array<string>).length > 1) {
          query.query.bool.must.splice(0, 0, { bool: { should: [] } });
          (value as Array<string>).forEach((item) => {
            query.query.bool.must[0].bool.should.push({
              query_string: { query: `*${item}*`, fields: [`${key}.name`] }
            });
          });
        } else {
          query.query.bool.must.push({
            query_string: {
              query: `*${(value as Array<string>).toString()}*`,
              fields: [`${key}.name`]
            }
          });
        }
      }
    }
  };

  private makeTransferNestedQuery = (query: any, nestedSearch: any) => {
    for (const [key, value] of Object.entries(nestedSearch)) {
      if (value) {
        if ((value as Array<string>).length > 1) {
          query.query.bool.must.splice(0, 0, { bool: { should: [] } });
          (value as Array<string>).forEach((item) => {
            query.query.bool.must[0].bool.should.push({
              query_string: {
                query: `*${item}*`,
                fields:
                  key === 'sku'
                    ? [`products.${key}.keyword`]
                    : [`products.${key}`]
              }
            });
          });
        } else {
          query.query.bool.must.push({
            query_string: {
              query: `*${(value as Array<string>).toString()}*`,
              fields:
                key === 'sku'
                  ? [`products.${key}.keyword`]
                  : [`products.${key}`]
            }
          });
        }
      }
    }
  };

  private filterData = (items: any, key: string) => {
    const result = items.hits.map((item: any) => ({
      ...(item._source || {}),
      id: +item._source?.id || item._source?.id
    }));
    return {
      [key]: result,
      total: items.total.value
    };
  };

  private checkIfIndexExists = async (index: string): Promise<boolean> => {
    const exists = await this.client.indices.exists({ index });
    if (exists.body) {
      return true;
    }
    return false;
  };

  private updateReferfenceNumberParam = (referenceNumbers: string[]) => {
    return referenceNumbers?.map((value) => {
      if (value.includes('OUT')) {
        return value.slice(0, 3) + '\\' + value.slice(3);
      } else if (value.includes('IN')) {
        return value.slice(0, 2) + '\\' + value.slice(2);
      } else {
        return value;
      }
    });
  };
}
