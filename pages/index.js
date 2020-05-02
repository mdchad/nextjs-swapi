import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Nav from '../components/nav'
// import fetch from 'unfetch'
import useSWR from 'swr'
import Link from 'next/link'
import fetch from 'node-fetch'
import { useInfiniteQuery, useQuery, usePaginatedQuery, queryCache } from 'react-query'

const API_URL = 'https://swapi.dev'

const Home = ({ json }) => {
  const [page, setPage] = React.useState(1)
  const fetchProjects = React.useCallback(async (key, page = 1) => {
    const res = await fetch(API_URL + '/api/vehicles/?page=' + page)
    const json = await res.json()
    return json
  }, [])

  const {
    status,
    resolvedData,
    latestData,
    error,
    isFetching,
  } = usePaginatedQuery(['vehicles', page], fetchProjects, { initialData: json })

  useEffect(() => {
    if (latestData?.next) {
      queryCache.prefetchQuery(['vehicles', page + 1], fetchProjects)
    }

    if (latestData?.previous) {
      queryCache.prefetchQuery(['vehicles', page - 1], fetchProjects)
    }
  }, [latestData, fetchProjects, page])

  if (status === 'loading') {
    return <div className='loading-indicator'><div className='loading'>....</div></div>
  }

  if (status === 'error') {
    return <span>Error: {error.message}</span>
  }

  return (
    <div>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isFetching ? <div className='loading-indicator'><div className='loading'>....</div></div> : null}
      <div className="hero">
        <h1 className="title">SWAPI</h1>
        <div className="row">
          { resolvedData.results.map((value, i) => {
            return (
              <Link href={'#'} key={i} >
                <div className="card">
                  <h1>{value.name}</h1>
                  <p>{value.manufacturer}</p>
                </div>
              </Link>
          )})}
        </div>
        <div className='button-wrapper'>
          <button className='button' onClick={() => setPage(old => Math.max(old - 1, 0))} disabled={page === 1}>Previous Page</button>
          <button className='button' onClick={() => setPage(old => (!latestData || !latestData?.next ? old : old + 1))}disabled={!latestData || !latestData.next}>Next Page</button>
        </div>
      </div>

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Avenir Next, Avenir,
            Helvetica, sans-serif;
        }
        .hero {
          width: 100%;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .title {
          margin: 0;
          width: 100%;
          padding-top: 80px;
          line-height: 1.15;
          font-size: 48px;
        }
        .title,
        .description {
          text-align: center;
        }
        .row {
          max-width: 880px;
          margin: 80px 40px 40px 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          border-radius: 10px;
          width: 100%;
          background-color: #1c262c;
          box-shadow: 0 11px 40px 0 rgba(0, 0, 0, 0.25), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
          border: none;
        }
        .card {
          padding: 28px 28px 30px;
          text-align: left;
          text-decoration: none;
          color: #ffffff;
          cursor: pointer;
          border-radius: 10px;
        }
        .card:hover {
          background-color: #fff;
          transform: scale(1.05);
        }
        .card:hover h1 {
          color: #1c262c;
        }
        .card h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
        }
        .card p {
          margin: 0;
          padding: 12px 0 0;
          font-size: 16px;
          font-weight: 600;
          color: #21bf73;
        }
        .button {
          padding: 20px;
          width: 150px;
          box-shadow: 0 11px 40px 0 rgba(0, 0, 0, 0.25), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
          border-radius: 5px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin: 0 20px; 
        }
        .button:disabled {
          cursor: not-allowed;
        }
        .button-wrapper {
          margin-bottom: 50px;
        }
        .loading-indicator {
          position: fixed;
          top: 10px;
          left: 10px;
        }
        .loading {
          border: 1px solid grey;
          border-radius: 4px;
          color: #fff;
          background-color: #1c262c;
          padding: 2px;
          position: absolute;
        }
      `}</style>
    </div>
  )
}

export async function getStaticProps() {
  // Call an external API endpoint to get posts.
  const res = await fetch(API_URL + '/api/vehicles/')
  const json = await res.json()

  // By returning { props: posts }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      json
    }
  }
}

export default Home
