import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
})

export const fetchZones        = ()   => api.get('/maps/zones').then(r => r.data)
export const fetchZone         = (id) => api.get(`/maps/zones/${id}`).then(r => r.data)
export const fetchStats        = ()   => api.get('/stats').then(r => r.data)
export const fetchAlerts       = ()   => api.get('/stats/alerts').then(r => r.data)
export const fetchReports      = ()   => api.get('/reports').then(r => r.data)
export const fetchIntelligence = ()   => api.get('/intelligence').then(r => r.data)
export const fetchIntelFeed    = ()   => api.get('/intelligence/feed').then(r => r.data)

export default api
