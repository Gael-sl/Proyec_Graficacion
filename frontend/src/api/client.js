// HTTP client for API calls
import { logger } from '@/lib/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const client = {
  async get(endpoint) {
    logger.api('GET', endpoint);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      
      if (!response.ok) {
        logger.error(`GET ${endpoint}`, {
          status: response.status,
          error: data.error || 'Unknown error'
        });
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      logger.apiResponse('GET', endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.error(`GET ${endpoint}`, error.message);
      throw error;
    }
  },

  async post(endpoint, data) {
    logger.api('POST', endpoint, data);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      
      if (!response.ok) {
        logger.error(`POST ${endpoint}`, {
          status: response.status,
          error: responseData.error || 'Unknown error'
        });
        throw new Error(responseData.error || `HTTP ${response.status}`);
      }
      
      logger.apiResponse('POST', endpoint, response.status, responseData);
      return responseData;
    } catch (error) {
      logger.error(`POST ${endpoint}`, error.message);
      throw error;
    }
  },

  async put(endpoint, data) {
    logger.api('PUT', endpoint, data);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      
      if (!response.ok) {
        logger.error(`PUT ${endpoint}`, {
          status: response.status,
          error: responseData.error || 'Unknown error'
        });
        throw new Error(responseData.error || `HTTP ${response.status}`);
      }
      
      logger.apiResponse('PUT', endpoint, response.status, responseData);
      return responseData;
    } catch (error) {
      logger.error(`PUT ${endpoint}`, error.message);
      throw error;
    }
  },

  async delete(endpoint) {
    logger.api('DELETE', endpoint);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE'
      });
      
      if (response.status !== 204 && !response.ok) {
        const error = await response.json();
        logger.error(`DELETE ${endpoint}`, {
          status: response.status,
          error: error.error || 'Unknown error'
        });
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      logger.apiResponse('DELETE', endpoint, response.status, 'Deleted');
    } catch (error) {
      logger.error(`DELETE ${endpoint}`, error.message);
      throw error;
    }
  }
};
