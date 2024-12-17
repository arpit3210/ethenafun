import { createClient, fetchExchange } from 'urql';

const GOLDSKY_ENDPOINT = process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT;

const client = createClient({
  url: GOLDSKY_ENDPOINT || '',
  exchanges: [fetchExchange]
});

export interface GameData {
  id: string;
  player: {
    address: string;
  };
  requestId: string;
  gameId: string;
  isHead: boolean;
  isWinner: boolean;
  betAmount: string;
  amountWon: string;
  bonus: boolean;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

export interface PlayerData {
  id: string;
  address: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalBetAmount: string;
  totalWinAmount: string;
  games: GameData[];
}

export interface GameStats {
  totalGames: number;
  totalPlayers: number;
  totalBetAmount: string;
  totalWinAmount: string;
  lastUpdated: string;
}

export const gameDataService = {
  async getPlayerGames(address: string): Promise<GameData[]> {
    const query = `
      query GetPlayerGames($address: String!) {
        player(id: $address) {
          games(orderBy: timestamp, orderDirection: desc) {
            id
            requestId
            gameId
            isHead
            isWinner
            betAmount
            amountWon
            bonus
            timestamp
            blockNumber
            transactionHash
          }
        }
      }
    `;

    try {
      const { data } = await client.query(query, { address: address.toLowerCase() }).toPromise();
      return data?.player?.games || [];
    } catch (error) {
      console.error('Error fetching player games:', error);
      return [];
    }
  },

  async getPlayerStats(address: string): Promise<PlayerData | null> {
    const query = `
      query GetPlayerStats($address: String!) {
        player(id: $address) {
          id
          address
          totalGames
          totalWins
          totalLosses
          totalBetAmount
          totalWinAmount
        }
      }
    `;

    try {
      const { data } = await client.query(query, { address: address.toLowerCase() }).toPromise();
      return data?.player || null;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  async getRecentGames(limit: number = 10): Promise<GameData[]> {
    const query = `
      query GetRecentGames($limit: Int!) {
        games(
          first: $limit, 
          orderBy: timestamp, 
          orderDirection: desc
        ) {
          id
          player {
            address
          }
          requestId
          gameId
          isHead
          isWinner
          betAmount
          amountWon
          bonus
          timestamp
          blockNumber
          transactionHash
        }
      }
    `;

    try {
      const { data } = await client.query(query, { limit }).toPromise();
      return data?.games || [];
    } catch (error) {
      console.error('Error fetching recent games:', error);
      return [];
    }
  },

  async getGameStats(): Promise<GameStats | null> {
    const query = `
      query GetGameStats {
        gameStats(id: "global") {
          totalGames
          totalPlayers
          totalBetAmount
          totalWinAmount
          lastUpdated
        }
      }
    `;

    try {
      const { data } = await client.query(query, {}).toPromise();
      return data?.gameStats || null;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return null;
    }
  }
};
