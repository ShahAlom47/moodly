import React from 'react';
import logo from '../assets/logo.png';
import Image from 'next/image'; 
const Heading = () => {
    return (
        <div className=' bg-[#061e41 bg-opacity-90 w-full px-5 py-3 flex gap-3 items-center justify-center shadow-m my-4'>
            <Image src={logo} alt='logo' className='w-10 h-10 rounded-full'></Image>
            <h1 className=' text-xl font-bold text-gray-900 '>MOODLY</h1>
            
        </div>
    );
};

export default Heading;