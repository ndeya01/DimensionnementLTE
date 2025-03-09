import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour les icônes de marqueurs (problème courant avec Leaflet et React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Composant de modale
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const LTEDimensioningForm = () => {
  const [formData, setFormData] = useState({
    propagation_model: 'OKUMURA_HATA',
    environment: 'URBAN',
    tx_power: 43,
    rx_sensitivity: -100,
    frequency: 2600,
    h_bs: 30,
    h_ue: 1.5,
    user_density: 1000,
    area_km2: 10,
    bandwidth: 10
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulations, setSimulations] = useState([]); // État pour stocker les simulations
  const [isMapModalOpen, setIsMapModalOpen] = useState(false); // État pour la modale de la carte

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'propagation_model' || name === 'environment' ? value : parseFloat(value);
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);

      // Ajouter la simulation à la liste
      const newSimulation = {
        id: Date.now(), // Identifiant unique
        parameters: { ...formData },
        results: { ...data }
      };
      setSimulations([...simulations, newSimulation]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les KPI
  const calculateKPIs = (results) => {
    if (!results) return null;
    const coverage = results.radius_km * results.radius_km * Math.PI; // Exemple simplifié
    const throughput = (formData.bandwidth * 1000) / results.num_sites; // Exemple simplifié
    return { coverage, throughput };
  };

  // Préparer les données pour le graphique
  const chartData = simulations.map((sim, index) => ({
    name: `Simulation ${index + 1}`,
    radius: sim.results.radius_km,
    sites: sim.results.num_sites,
    coverage: calculateKPIs(sim.results).coverage,
    throughput: calculateKPIs(sim.results).throughput
  }));

  // Exemple de coordonnées pour la carte
  const defaultCenter = [14.7167, -17.4677]; // Latitude et longitude de Dakar, Sénégal
  const defaultZoom = 10;

  return (
    <div className='w-full bg-white'>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">Calculateur de Dimensionnement LTE</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 text-blue-700">Paramètres Généraux</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Modèle de Propagation</label>
                <select 
                  name="propagation_model"
                  value={formData.propagation_model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OKUMURA_HATA">Okumura-Hata</option>
                  <option value="COST231_HATA">COST231-Hata</option>
                  <option value="TR36_814">3GPP TR36.814</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Environnement</label>
                <select 
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="URBAN">Urbain</option>
                  <option value="SUBURBAN">Suburbain</option>
                  <option value="RURAL">Rural</option>
                  <option value="DENSE_URBAN">Urbain Dense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Puissance d'émission (dBm)</label>
                <input 
                  type="number"
                  name="tx_power"
                  value={formData.tx_power}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sensibilité du récepteur (dBm)</label>
                <input 
                  type="number"
                  name="rx_sensitivity"
                  value={formData.rx_sensitivity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fréquence (MHz)</label>
                <input 
                  type="number"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 text-blue-700">Paramètres Avancés</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hauteur de station de base (m)</label>
                <input 
                  type="number"
                  name="h_bs"
                  value={formData.h_bs}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hauteur d'équipement utilisateur (m)</label>
                <input 
                  type="number"
                  name="h_ue"
                  value={formData.h_ue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Densité d'utilisateurs (/km²)</label>
                <input 
                  type="number"
                  name="user_density"
                  value={formData.user_density}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Surface de zone (km²)</label>
                <input 
                  type="number"
                  name="area_km2"
                  value={formData.area_km2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bande passante (MHz)</label>
                <input 
                  type="number"
                  name="bandwidth"
                  value={formData.bandwidth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Calcul en cours..." : "Calculer"}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {results && !error && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Résultats de l'Analyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-blue-700 mb-2">Rayon de Cellule</h3>
                <p className="text-3xl font-bold text-blue-900">{results.radius_km} km</p>
              </div>
              <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-blue-700 mb-2">Nombre de Sites Requis</h3>
                <p className="text-3xl font-bold text-blue-900">{results.num_sites}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Indicateurs de Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>Couverture: <span className="font-semibold">{calculateKPIs(results).coverage.toFixed(2)} km²</span></div>
                <div>Débit: <span className="font-semibold">{calculateKPIs(results).throughput.toFixed(2)} Mbps</span></div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Paramètres utilisés</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>Modèle: <span className="font-semibold">{formData.propagation_model}</span></div>
                <div>Environnement: <span className="font-semibold">{formData.environment}</span></div>
                <div>Fréquence: <span className="font-semibold">{formData.frequency} MHz</span></div>
                <div>Tx Power: <span className="font-semibold">{formData.tx_power} dBm</span></div>
                <div>Surface: <span className="font-semibold">{formData.area_km2} km²</span></div>
                <div>Densité: <span className="font-semibold">{formData.user_density}/km²</span></div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Afficher la carte
              </button>
            </div>
          </div>
        )}

        {/* Graphique des simulations */}
        {simulations.length > 0 && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Comparaison des Simulations</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="radius" fill="#8884d8" name="Rayon de cellule (km)" />
                <Bar dataKey="sites" fill="#82ca9d" name="Nombre de sites" />
                <Bar dataKey="coverage" fill="#ffc658" name="Couverture (km²)" />
                <Bar dataKey="throughput" fill="#ff8042" name="Débit (Mbps)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Modale avec la carte */}
        <Modal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)}>
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Carte de Dimensionnement</h2>
          <div className="w-full h-96">
            <MapContainer center={defaultCenter} zoom={defaultZoom} className="w-full h-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Exemple de cercle de couverture */}
              <Circle
                center={defaultCenter}
                radius={results?.radius_km * 1000 || 1000} // Convertir le rayon en mètres
                color="blue"
                fillColor="blue"
                fillOpacity={0.2}
              >
                <Popup>
                  Rayon de couverture : {results?.radius_km || 0} km
                </Popup>
              </Circle>
              {/* Exemple de marqueur pour un site */}
              <Marker position={defaultCenter}>
                <Popup>
                  Site de base : <br />
                  Latitude: {defaultCenter[0]}, Longitude: {defaultCenter[1]}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </Modal>
      </div>  
    </div>
  );
};

export default LTEDimensioningForm;