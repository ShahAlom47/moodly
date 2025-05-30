import Image from 'next/image';
import React from 'react';
import bannerImage from '../assets/Moodly.png';
import bannerImageMobile from '../assets/Moodly-mobile.png';

const Banner = () => {
  return (
    <div className="relative w-full">
      {/* Banner Image */}
      <div className="w-full lg:block hidden">
        <Image
          src={bannerImage}
          alt="Moodly Banner"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
      <div className="w-full lg:hidden block">
        <Image
          src={bannerImageMobile}
          alt="Moodly Banner Mobile"
          width={1080}
          height={1080}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Text/Image Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <div className="text-white text-center bg-black bg-opacity-50 rounded-lg p-6">
          {/* Example image or text inside the overlay */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Moodly</h1>
          <p className="text-lg md:text-xl">Detect your mood. Feel the theme. Hear the vibe.</p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
