import React from 'react';
import image1 from '../assets/images.jpeg'
import { Link } from 'react-router-dom';

const Planning = () => {
  return (
    <div className='w-full bg-white py-16 px-4'>
      <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
      <img className='w-[500px] mx-auto my-4' src={image1} alt='/'/>
      <div className='flex flex-col justify-center'>
        <p className='text-[#00df9a] font-bold '>OUTIL DE DIMENSIONNEMENT RÉSEAU</p>
        <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>
        Planifiez et dimensionnez vos réseaux efficacement
        </h1>
        <p>
        Notre outil vous permet de concevoir, planifier et optimiser les réseaux LTE, UMTS et GSM avec précision. Grâce à des algorithmes avancés, vous pouvez estimer les besoins en stations de base, gérer les fréquences et garantir une couverture optimale.
        </p>
        <Link to='/dimension'>
          <button className='text-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto md:mx-0 py-3 bg-black'>Commençons</button>
        </Link>
      </div>
    </div>
    </div>
  );
}

export default Planning;
