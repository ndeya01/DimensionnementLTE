import React from 'react';
import Navbar from '../components/Navbar';
import Welcome from '../components/Welcome';
import Planning from '../components/Planning';
import Description from '../components/Description';
import Footer from '../components/Footer';

const Acceuil = () => {
  return (
    <div>
      <Navbar/>
      <Welcome/>
      <Planning/>
      <Description/>
      <Footer/>
    </div>
  );
}

export default Acceuil;
