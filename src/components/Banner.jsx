"use client";
import Image from "next/image";
import React from "react";
import bannerImage from "../assets/Moodly.png";
import bannerImageMobile from "../assets/Moodly-mobile.png";

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

      {/* Video Overlay */}
      <div className="absolute inset-0 flex flex-col items-end justify-center z-10 p-4">
        <div className="w-40 h-40 md:w-72 md:h-72 rounded-xl overflow-hidden shadow-lg opacity-50">
          <video
            src="/faceVideo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-end z-20 text-white text-center p-4">
        
        <button className=" text-white font-bold  border-2 border-white  text-xl  rounded-full px-5 py-1 hover:scale-110   tran  ">Start</button>
      </div>
    </div>
  );
};

export default Banner;
