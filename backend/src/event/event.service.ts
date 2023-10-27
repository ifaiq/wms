import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvent } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async generateEvents(
    id: number,
    data: any,
    tableName: string,
    updatedBy: number
  ) {
    const newObject = data;
    if (newObject.createdAt) {
      delete newObject.createdAt;
    }
    if (newObject.updatedAt) {
      delete newObject.updatedAt;
    }
    const oldObject = await this.getRecordfromDB(tableName, id);

    if (oldObject === undefined) {
      return [];
    }

    const resultObject = this.comapareObjects(oldObject, newObject);
    const tableReferenceId = oldObject.id;
    const promiseArray: PrismaPromise<CreateEvent>[] = [];
    for (const record in resultObject) {
      const fieldName = record;
      const oldValue = resultObject[record].oldValue;
      const newValue = resultObject[record].newValue;
      const data: CreateEvent = {
        tableName,
        tableReferenceId,
        fieldName,
        oldValue,
        newValue,
        updatedBy
      };
      promiseArray.push(this.createEvent(data));
    }
    return promiseArray;
  }

  private createEvent = (data: CreateEvent): PrismaPromise<CreateEvent> =>
    this.prisma.event.create({ data });

  private async getRecordfromDB(tableName: string, id: number): Promise<any> {
    const query = Prisma.raw(`SELECT * FROM ${tableName} where id = ${id}`);
    const result: any = await this.prisma.$queryRaw(query);
    return result[0];
  }

  private comapareObjects(oldObject: any, newObject: any) {
    const resultObject: any = {};
    for (const key in newObject) {
      if (typeof oldObject[key] === 'object') {
        const oldValue = JSON.stringify(oldObject[key]);
        const newValue = JSON.stringify(newObject[key]);
        if (oldValue !== newValue) {
          resultObject[key] = {
            oldValue,
            newValue
          };
        }
      } else if (oldObject[key] != newObject[key]) {
        const oldValue = String(oldObject[key]);
        const newValue =
          typeof newObject[key] === 'boolean'
            ? +newObject[key]
            : newObject[key];
        resultObject[key] = { oldValue, newValue: String(newValue) };
      }
    }
    return resultObject;
  }
}
