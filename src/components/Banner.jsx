"use client";
import Image from "next/image";
import React from "react";
import bannerImage from "../assets/Moodly.png";
import bannerImageMobile from "../assets/Moodly-mobile.png";
import Link from "next/link";

const Banner = () => {
  return (
    <div className="relative w-full h-scree  ">
      {/* Banner Image */}
      <div className="w-full h-full h-screen lg:block hidden ">
        <Image
          src={bannerImage}
          alt="Moodly Banner"
          width={1920}
          height={1080}
          className="w-full h-screen "
          priority
        />
      </div>
      <div className="h-full lg:hidden block overflow-x-hidden   ">
        <Image
          src={bannerImageMobile}
          alt="Moodly Banner Mobile" 
          width={1080}
          height={1080}
          className=" h-screen w-full "
          priority
        />
      </div>

      {/* Video Overlay */}
      <div className="absolute inset-0  grid lg:grid-cols-2 gap-3  items-center  justify-center z-10 p-4  ">
        <div className="lg:flex hidden "></div>
        <div className=" flex items-cente justify-center mb-16  ">
            <video
              src="/faceVideo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="lg:w-[80%] w-[60%] lg:h-full rounded-full  opacity-30"
            />
        </div>
      </div>
      <div className="absolute inset-0 bottom-0 flex  items-end justify-center z-20 text-white text-center h-full p-4  ">
        <Link href={"webcam"} className="   w-full z-50  absolute lg:bottom-[10%] bottom-[32%]"   >
          {" "}
          <button className=" mx-auto bg-blue-600  text-black font-semibold  text-xl  rounded-full px-5 py-1 hover:scale-105 transition-all duration-300 ease-in-out  hover:bg-blue-700  ">
            Start
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
