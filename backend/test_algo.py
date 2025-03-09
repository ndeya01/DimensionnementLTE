from lte_algo import LTEDimensioning, PropagationModel, EnvironmentType

# Initialisation du moteur
lte_engine = LTEDimensioning()
lte_engine.propagation_model = PropagationModel.OKUMURA_HATA
lte_engine.environment = EnvironmentType.URBAN

# Test 1 : Rayon de cellule 
radius = lte_engine.calculate_cell_radius(
    tx_power=43,
    rx_sensitivity=-100,
    frequency=2600,
    h_bs=30,       
    h_ue=1.5       
)
print(f"[TEST] Le rayon estimé est de : {radius} km")  # ~1.2-2.0 km selon l'environnement

# Test 2 : Nombre de sites 
num_sites = lte_engine.estimate_sites(
    user_density=1000,
    area_km2=10,
    bandwidth=10,    
    spectral_efficiency=2.5  
)
print(f"[TEST] Sites nécessaires : {num_sites}")  # ~150-250 selon paramètres

# Test 3 : Allocation PCI 
sites = [
    {"id": "site1", "neighbors": ["site2"], "priority": 1},
    {"id": "site2", "neighbors": ["site1"], "priority": 2}  
]
pci = lte_engine.allocate_pci(sites)
print(f"[TEST] PCI attribués : {pci}")  # Ex: {'site1': 145, 'site2': 32}

# Paramètres avec valeurs par défaut
params = {
    "tx_power": 43,
    "rx_sensitivity": -100,
    "frequency": 2600,
    "h_bs": 30,
    "h_ue": 1.5,
    "penetration_loss": 15
}

# Calcul final avec tous les paramètres
radius = lte_engine.calculate_cell_radius(**params)
print(f"Rayon calculé : {radius} km")  # Résultat plus précis avec Okumura-Hata