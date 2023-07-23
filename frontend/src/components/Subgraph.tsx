import { useQuery, gql } from "@apollo/client"

const GET_PROTOCOL_FIREWALL_STATUSES = gql`
  query GetProtocols {
    protocols {
        id
        firewallStatus
    }
  }
`

function Subgraph() {
  const { loading, error, data } = useQuery(GET_PROTOCOL_FIREWALL_STATUSES)

  return (
    <div className="cookie3">
      <div className="section3">
        <div>
          <h2>circuit breaker triggered</h2>
          <p className=" mb-12">
          </p>

          {loading && "... loading"}

          {error && <div className="text-red-700">{error}</div>}

          {data &&
            Array.isArray(data?.mintSmartContractNFTs) &&
            data.mintSmartContractNFTs?.map((item) => {
              return (
                <div
                  key={item.id}
                  className="mb-6 flex flex-col items-start w-2/3 mx-auto border-2 border-white rounded-lg p-2 break-all"
                >
                  <p className="self-end">
                    Audited:{" "}
                    {item.blockTimestamp &&
                      new Date(item.blockTimestamp * 1e3).toLocaleString()}
                  </p>

                  <p>Auditor: {}</p>
                  <p>ContractAddress: {protocol.id}</p>
                  <p>ContractType: {}</p>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Subgraph