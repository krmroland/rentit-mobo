export interface FormOptions {
  beforeSave?: (values: object) => object;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}
