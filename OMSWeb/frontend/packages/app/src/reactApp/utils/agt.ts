import axios from 'axios'
import { getStorage } from '@daimre/shared'

const ss = getStorage(window.sessionStorage)

const origin = ''
const apiBaseUri = '/api'

const ax = axios.create({
	baseURL: `${origin}${apiBaseUri}`,
	headers: {},
	timeout: 60000 * 20,
})

const _ax = (method, url, prms, config) => {
	switch (method) {
		case 'post':
		case 'put':
		case 'patch':
			return ax[method](url, prms, config)
		case 'get':
		case 'delete':
		case 'head':
		case 'options':
			return ax[method](url, config)
		default:
			break
	}
}

const request = (headers) => (method) => (url) => (prms) => {
	const promise = _ax(method, url, prms, {
		headers: { ...headers },
	})

	return promise
}

export const getAgt = () => {
	const token = ss.get('jwt')

	const headers = {
		Authorization: `Bearer ${token}`,
	}

	const rgAuth = request(headers)('get')
	const rpAuth = request(headers)('post')

	return {
		// systemSettingsClient: rgAuth('/systems/settings/client'),
		// systemStates: rgAuth('/systems/states'),
		stats: rpAuth('/report/stats'),
		charts: rpAuth('/report/charts'),
		labels: rgAuth('/report/labels'),
		trend: rgAuth('/report/trend'),
		utilization: rgAuth('/report/trend/utilization'),
		deliveryTime: rgAuth('/report/trend/delivery-time'),
	}
}
