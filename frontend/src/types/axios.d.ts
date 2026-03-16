import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    audit?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    audit?: boolean;
  }
}
