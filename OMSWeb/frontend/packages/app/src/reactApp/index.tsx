import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
})

const DefaultApp = ({ location }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <App location={location} />
      {/* <ReactQueryDevtools initialIsOpen /> */}
    </QueryClientProvider>
  )
}

export default DefaultApp


