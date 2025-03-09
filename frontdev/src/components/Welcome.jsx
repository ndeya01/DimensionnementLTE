import React from 'react';
import { ReactTyped } from "react-typed";
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className='text-white'>
      <div className='max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
        <p className='text-[#00df9a] font-bold p-2'>OPTIMISATION DES PERFORMANCES RÉSEAU</p>
        <h1 className='md:text-7xl sm:text-6xl text-4xl font-bold md:py6'>Planifiez avec précision</h1>
        <div className='flex justify-center items-center'>
            <p className='md:text-5xl sm:text-4xl text-xl font-bold py-4'>Des outils puissants pour</p>
            <ReactTyped
            className='md:text-5xl sm:text-4xl text-xl font-bold md:pl-4 pl-2'
            strings={[
                'LTE', 'UMTS', 'GSM'
            ]}
            typeSpeed={120}
            backSpeed={140}
            loop
            />
        </div>
        <p className='md:text-2xl text-xl font-bold text-gray-500'>
            Dimensionnez et planifiez efficacement les réseaux LTE, UMTS et GSM.
        </p>
        <Link to='/dimension'>
          <button className='bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black'>Commençons</button>
        </Link>
      </div>
    </div>
  );
}

export default Welcome;
