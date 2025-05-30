import Banner from '@/components/Banner';
import WebcamFeed from '@/components/WebcamFeed';
import React from 'react';

const Home = () => {
  return (
    <div className=''>
      <Banner></Banner>
        <WebcamFeed />
    </div>
  );
};

export default Home;