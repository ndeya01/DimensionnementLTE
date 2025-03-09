from flask import Flask, jsonify, request
from flask_cors import CORS
from lte_algo import LTEDimensioning, PropagationModel, EnvironmentType

app = Flask(__name__)
CORS(app)

lte_engine = LTEDimensioning()

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        
        # Configuration du moteur
        lte_engine.propagation_model = PropagationModel[data.get('propagation_model', 'OKUMURA_HATA')]
        lte_engine.environment = EnvironmentType[data.get('environment', 'URBAN')]
        
        # Calcul du rayon
        radius = lte_engine.calculate_cell_radius(
            tx_power=float(data.get('tx_power', 43)),
            rx_sensitivity=float(data.get('rx_sensitivity', -100)),
            frequency=float(data.get('frequency', 2600)),
            h_bs=float(data.get('h_bs', 30)),
            h_ue=float(data.get('h_ue', 1.5))
        )
        
        # Estimation des sites
        num_sites = lte_engine.estimate_sites(
            user_density=float(data.get('user_density', 1000)),
            area_km2=float(data.get('area_km2', 10)),
            bandwidth=float(data.get('bandwidth', 10))
        )
        
        return jsonify({
            "radius_km": round(radius, 2),
            "num_sites": num_sites,
            "pci_allocation": {}  # Optionnel si non utilisé
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)