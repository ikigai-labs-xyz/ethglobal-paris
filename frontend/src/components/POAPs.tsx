import { init, useQuery } from '@airstack/airstack-react';
import 'animate.css';
import poap from '../assets/poap.svg';

const query = `query PoapsValerioFicheraEth {
  Poaps(input: { filter: { owner: { _eq: "vitalik.eth" } }, blockchain: ALL, limit: 10 }) {
    Poap {
      eventId
      poapEvent {
        eventName
        eventURL
        startDate
        endDate
        country
        city
        contentValue {
          image {
            extraSmall
            large
            medium
            original
            small
          }
        }
      }
    }
  }
}`;

init('ef3d1cdeafb642d3a8d6a44664ce566c');

interface PoapData {
  eventId: string;
  poapEvent: {
    eventName: string;
    eventURL: string;
    startDate: string;
    endDate: string;
    country: string;
    city: string;
    contentValue: {
      image: {
        small: string;
      };
    };
  };
}

export default function POAPs() {
  const { data, loading, error } = useQuery<{ Poaps: { Poap: PoapData[] } }>(query, {});

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex lg:flex-row-reverse flex-col-reverse items-center justify-items-center pb-5">
        <span className="lg:text-left text-center text-6xl font-medium text-purple-800 pl-5">
          Vitalik's POAPs
          <p className="text-2xl font-medium text-purple-800">powered by Airstack react SDK</p>
        </span>
        <img
          className="animate__animated animate__fadeInLeft"
          src={poap}
          alt="Poap Logo"
          width={150}
          height={50}
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && data.Poaps && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate__animated animate__fadeInUp">
          {data.Poaps.Poap.map((poap) => (
            <li key={poap.eventId}>
              <div className="bg-slate-800/40 border-emerald-500 rounded-lg p-3 flex xl:flex-row flex-col items-center h-full h-full">
                <div className="flex-shrink-0">
                  <img
                    className="w-48"
                    src={poap.poapEvent.contentValue.image.small}
                    alt="POAP Image"
                  />
                </div>
                <div className="flex flex-col xl:text-left text-center justify-center xl:pl-5 p-5">
                  <p className="text-base text-pink-800">{poap.poapEvent.eventName}</p>
                  <p className="text-sm text-white">📍{poap.poapEvent.city}, {poap.poapEvent.country}</p>
                  <a href={poap.poapEvent.eventURL} className="text-white underline">
                    Reference →
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
