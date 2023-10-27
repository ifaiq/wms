interface IUser {
  id?: TNumberOrString;
  name: string;
  email: string;
  password?: string;
  roles: TNumberOrString[];
}

interface IUserHeading {
  headingText: string;
  pageBreadCrumb: IRoute[];
  id?: TNumberOrString;
}
