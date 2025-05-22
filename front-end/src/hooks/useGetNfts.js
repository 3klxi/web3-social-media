import { useState, useEffect } from 'react';
import axios from 'axios';

const useGetNfts = (address) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNfts = async () => {
      if (!address) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://127.0.0.1:3001/api/web3/nft/get_nfts`, {
          params: { address }
        });

        setNfts(response.data.imageUrls || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNfts();
  }, [address]);

  return { nfts, loading, error };
};

export default useGetNfts;
