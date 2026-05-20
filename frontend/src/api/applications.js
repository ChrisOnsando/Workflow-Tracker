import client from './client'

export const listApplications = () =>
  client.get('/v1/workflows/').then(r => r.data)

export const getApplication = id =>
  client.get(`/v1/workflows/${id}`).then(r => r.data)

export const createApplication = data =>
  client.post('/v1/workflows/', data).then(r => r.data)

export const updateApplication = (id, data) =>
  client.patch(`/v1/workflows/${id}`, data).then(r => r.data)

export const submitApplication = id =>
  client.post(`/v1/workflows/${id}/submit`).then(r => r.data)

export const startReview = id =>
  client.post(`/v1/workflows/${id}/start-review`).then(r => r.data)

export const recordDecision = (id, data) =>
  client.post(`/v1/workflows/${id}/decision`, data).then(r => r.data)
