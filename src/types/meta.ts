

export interface ResourceMeta {
  creator: string;
  createdTime: string;
  updater: string;
  updatedTime: string;
  resourceId: string;
  revisionId: string;
}
export interface Resource<T> {
  meta: ResourceMeta;
  data: T;
}
