import { api } from "./api";

// User services
export const getOtp = (payload: any) => api.post(`/user/getOtp`, payload);

export const createAccount = (payload: any) => api.post(`/user/login`, payload);

export const googleLogin = (payload: any) =>
  api.post(`/user/googleLogin`, payload);

export const verifyOtp = (payload: any) => api.post(`/user/verifyOtp`, payload);

export const verifyPin = (payload: any) => api.post(`/user/verifyPin`, payload);

export const getUserById = (payload: any) =>
  api.post(`/user/getUserById`, payload);

export const updateUser = (id: string, payload: FormData) =>
  api.post(`/user/update/${id}`, payload);

export const logoutUser = (payload: any) =>
  api.post(`/user/logoutUser`, payload);

// agent
export const createAgent = (payload: any) =>
  api.post(`/user/createAgent`, payload);

export const removeAgent = (id: string, payload: any) =>
  api.post(`/user/removeAgent/${id}`, payload);

// Business
export const getBusiness = (payload: any) =>
  api.post(`/business/getBusiness`, payload);

export const createBusiness = (payload: any) =>
  api.post(`/business/createBusiness`, payload);

export const updateBusiness = (payload: any) =>
  api.post(`/business/updateBusiness`, payload);

export const getBusinessById = (id: string, payload: any) =>
  api.post(`/business/getBusiness/${id}`, payload);

// Leads
export const getLeads = (payload: any) => api.post(`/lead/getLeads`, payload);

export const createLead = (payload: any) =>
  api.post(`/lead/createLead`, payload);

export const updateLead = (payload: any) =>
  api.post(`/lead/updateLead`, payload);

export const getLeadActivity = (payload: any) =>
  api.post(`/lead/getLeadActivity`, payload);

export const uploadLeads = (payload: any) =>
  api.post(`/lead/uploadLeads`, payload);

export const exportLeads = (payload: any) =>
  api.post(`/lead/exportLeads`, payload, { responseType: "blob" });

export const getLeadById = (id: string, payload: any) =>
  api.post(`/lead/getById/${id}`, payload);

export const deleteLead = (payload: any) =>
  api.post(`/lead/deleteLead`, payload);

// dasboard
export const getDashboardData = (payload: any) =>
  api.post(`/dashboard/getDashboardData`, payload);

// calle agent
// export const createCall = (payload: any) => api.post(`/call-e/call`, payload);

// Transaction
export const getAllTransactions = (payload: any) =>
  api.post(`/subscription/getAllTransactions`, payload);

export const exportTransactions = (payload: any) =>
  api.post(`/subscription/exportTransactions`, payload, {
    responseType: "blob",
  });

export const createSubscriptionOrder = (payload: any) =>
  api.post(`/subscription/create-order`, payload);

export const confirmSubscription = (payload: any) =>
  api.post(`/subscription/confirmSubscription`, payload);

export const checkPaymentStatus = (payload: any) =>
  api.post(`/subscription/checkPaymentStatus`, payload);

// Agent
export const uploadDoc = (payload: any) =>
  api.post(`/agent/upload-doc`, payload);

export const getDocStatus = (payload: any) =>
  api.post(`/agent/getDocStatus`, payload);

export const deleteDoc = (payload: any) =>
  api.post(`/agent/deleteDoc`, payload);

export const agentChat = (payload: any) => api.post(`/agent/chat`, payload);

export const triggerCall = (payload: any) =>
  api.post(`/agent/trigger-call`, payload);

export const getCallHistory = (payload: any) =>
  api.post(`/agent/getCallHistory`, payload);

export const getCallStats = (payload: any) =>
  api.post(`/agent/getCallStats`, payload);
