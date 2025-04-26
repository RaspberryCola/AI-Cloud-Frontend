import { httpClient } from "./httpClient";
import { ApiResponse } from "../types/common";
import { 
  ModelItem, 
  ModelListParams, 
  CreateModelRequest
} from "../types/model";

class ModelService {
  private static instance: ModelService;

  private constructor() {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  async getModelList(params?: ModelListParams): Promise<ApiResponse<ModelItem[]>> {
    const url = params?.type ? `/model/list?type=${params.type}` : '/model/list';
    return httpClient.get(url);
  }

  async createModel(data: CreateModelRequest): Promise<ApiResponse<null>> {
    return httpClient.post('/model/create', data);
  }

  async deleteModel(modelId: string): Promise<ApiResponse<null>> {
    return httpClient.delete(`/model/delete/${modelId}`);
  }
}

export const modelService = ModelService.getInstance();