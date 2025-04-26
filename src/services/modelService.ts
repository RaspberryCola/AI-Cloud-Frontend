import { httpClient } from "./httpClient";
import { ApiResponse } from "../types/common";
import { 
  ModelItem, 
  ModelListParams, 
  CreateModelRequest,
  UpdateModelRequest
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

  async getModelDetail(modelId: string): Promise<ApiResponse<ModelItem>> {
    return httpClient.get(`/model/get?model_id=${modelId}`);
  }

  async updateModel(data: UpdateModelRequest): Promise<ApiResponse<null>> {
    return httpClient.put('/model/update', data);
  }

  async deleteModel(modelId: string): Promise<ApiResponse<null>> {
    return httpClient.delete(`/model/delete?model_id=${modelId}`);
  }
}

export const modelService = ModelService.getInstance();