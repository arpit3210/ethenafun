import { createClient, fetchExchange } from 'urql';

const GOLDSKY_API_KEY = process.env.NEXT_PUBLIC_GOLDSKY_API_KEY || '';

const client = createClient({
  url: `https://api.goldsky.com/${GOLDSKY_API_KEY}/graphql`,
  exchanges: [fetchExchange]
});

export interface GameStats {
  id: string;
  player: string;
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

export interface PlayerStats {
  address: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalBetAmount: string;
  totalWinAmount: string;
  winRate: number;
  games: GameStats[];
}

export const goldskyService = {
  async getPlayerStats(address: string): Promise<PlayerStats | null> {
    const query = `
      query GetPlayerStats($address: String!) {
        player(address: $address) {
          address
          totalGames
          totalWins
          totalLosses
          totalBetAmount
          totalWinAmount
          winRate
          games {
            id
            player
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
      if (!data?.player) return null;

      const player = data.player;
      return {
        ...player,
        winRate: player.totalGames > 0 ? (player.totalWins / player.totalGames) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  async getRecentGames(limit: number = 10): Promise<GameStats[]> {
    const query = `
      query GetRecentGames($limit: Int!) {
        games(first: $limit, orderBy: timestamp, orderDirection: desc) {
          id
          player
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

  async getGameStats(): Promise<{ totalGames: number; totalWinAmount: string; totalBetAmount: string }> {
    const query = `
      query GetGameStats {
        gameStats {
          totalGames
          totalWinAmount
          totalBetAmount
        }
      }
    `;

    try {
      const { data } = await client.query(query, {}).toPromise();
      return data?.gameStats || {
        totalGames: 0,
        totalWinAmount: '0',
        totalBetAmount: '0'
      };
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return {
        totalGames: 0,
        totalWinAmount: '0',
        totalBetAmount: '0'
      };
    }
  }
};
