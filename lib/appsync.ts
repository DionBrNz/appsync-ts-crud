export type AppSyncEvent<T> = {
    identity?: {
      sub?: string | null;
      email?: string | null;
    } | null;
    arguments: {
      input: T;
    };
  };
  
  export type AppSyncResult<T> = {
    data: T | null;
    errorInfo: any | null;
    errorType: string | null;
    errorMessage: string | null;
  };


  