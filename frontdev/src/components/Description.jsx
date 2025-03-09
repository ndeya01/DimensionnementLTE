import React from 'react';
import gain from '../assets/gain.png';
import modele from '../assets/modele1.jpg';
import enod from '../assets/enod.png';

const Description = () => {
  return (
    <div className='w-full py-[4rem] px-4 pt-1'>
      <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
        <div className='w-full bg-white shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
          <div className=''>
            <img className='w-auto mx-auto bg-white' src={gain} alt='/'/>
          </div>
          <div>
            <h2 className='text-2xl font-bold text-center py-8 pb-2'>Bilan de liaison & MAPL</h2>
            <p className='py-2 border-b mx-8'>
              Le bilan de liaison calcule les pertes de signal entre l'émetteur et le récepteur. Le MAPL (Maximum Accepted Path Loss) représente la perte maximale tolérée pour une connexion stable, essentielle pour déterminer la portée des stations de base.
            </p>
          </div>
        </div>
        <div className='w-full bg-white shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
          <div className=''>
            <img className='w-auto mx-auto bg-white' src={modele} alt='/'/>
          </div>
          <div>
            <h2 className='text-2xl font-bold text-center py-8 pb-2'>Modèles de propagation</h2>
            <p className='py-2 border-b mx-8'>
              Les modèles de propagation prédisent la propagation des ondes radio. Des modèles comme Okumura-Hata ou COST 231 estiment les pertes de signal en fonction de la distance, des obstacles et des conditions environnementales.            </p>
          </div>
        </div>
        <div className='w-full bg-white shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
          <div className=''>
            <img className='w-auto mx-auto bg-white' src={enod} alt='/'/>
          </div>
          <div>
            <h2 className='text-2xl font-bold text-center py-8 pb-2'>Dimensionnement</h2>
            <p className='py-2 border-b mx-8'>
            Le dimensionnement des réseaux LTE consiste à déterminer le nombre optimal de stations de base, leur emplacement et leur configuration pour assurer une couverture et une capacité adéquates. Cela inclut le calcul des fréquences, la gestion des interférences et l'optimisation des ressources radio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Description;
