import math
from enum import Enum

class PropagationModel(Enum):
    OKUMURA_HATA = 1
    COST231_HATA = 2
    TR36_814 = 3

class EnvironmentType(Enum):
    URBAN = 1
    SUBURBAN = 2
    RURAL = 3
    DENSE_URBAN = 4

class LTEDimensioning:
    def __init__(self):
        self.propagation_model = PropagationModel.OKUMURA_HATA
        self.environment = EnvironmentType.URBAN
        
    def calculate_path_loss(self, d, freq, h_bs, h_ue):
       
        if self.propagation_model == PropagationModel.OKUMURA_HATA:
            return self._okumura_hata(d, freq, h_bs, h_ue)
        elif self.propagation_model == PropagationModel.COST231_HATA:
            return self._cost231_hata(d, freq, h_bs, h_ue)
        else:
            return self._3gpp_tr36814(d, freq, h_bs, h_ue)

    def _okumura_hata(self, d, freq, h_bs, h_ue):
        a_hue = (1.1*math.log10(freq) - 0.7)*h_ue - (1.56*math.log10(freq) - 0.8)
        
        L = 69.55 + 26.16*math.log10(freq) 
        L -= 13.82*math.log10(h_bs) - a_hue
        L += (44.9 - 6.55*math.log10(h_bs))*math.log10(d)
        
        # Corrections environnementales
        if self.environment == EnvironmentType.SUBURBAN:
            L -= 2*(math.log10(freq/28))**2 - 5.4
        elif self.environment == EnvironmentType.RURAL:
            L -= 4.78*(math.log10(freq))**2 + 18.33*math.log10(freq) - 40.94
            
        return L

    def _cost231_hata(self, d, freq, h_bs, h_ue):
        if freq >= 2000:
            a_hue = 3.2*(math.log10(11.75*h_ue))**2 - 4.97 
        else:
            a_hue = 8.29*(math.log10(1.54*h_ue))**2 - 11
        
        L = 46.3 + 33.9*math.log10(freq)
        L -= 13.82*math.log10(h_bs) - a_hue
        L += (44.9 - 6.55*math.log10(h_bs))*math.log10(d)
        
        if self.environment == EnvironmentType.DENSE_URBAN:
            L += 3  # Correction pour milieu urbain dense
            
        return L

    def _3gpp_tr36814(self, d, freq, h_bs, h_ue):
        """Modèle 3GPP original pour rétro-compatibilité"""
        return 40*(1 - 4e-3*h_bs)*math.log10(d*1000) - 18*math.log10(h_bs) + 21*math.log10(freq) + 80

    def calculate_cell_radius(self, tx_power, rx_sensitivity, **kwargs):
        # Extraction des paramètres avec valeurs par défaut
        freq = kwargs.get('frequency', 2600)
        h_bs = kwargs.get('h_bs', 30)
        h_ue = kwargs.get('h_ue', 1.5)
        margins = {
            'feeder_loss': kwargs.get('feeder_loss', 2),
            'interference': kwargs.get('interference_margin', 3),
            'body_loss': kwargs.get('body_loss', 3),
            'penetration': kwargs.get('penetration_loss', 15),
            'shadowing': kwargs.get('shadowing_margin', 8)
        }

        # Calcul MAPL (Maximum Allowable Path Loss)
        MAPL = tx_power - margins['feeder_loss'] + kwargs.get('tx_gain', 17)
        MAPL -= (rx_sensitivity + margins['body_loss'] + margins['penetration'])
        MAPL += kwargs.get('rx_gain', 0)
        MAPL -= sum(margins.values()) - margins['feeder_loss']  # Correction double comptage

        # Résolution numérique par dichotomie améliorée
        d_low, d_high = 0.01, 100.0  # Étendue étendue
        tolerance = 0.001
        for _ in range(1000):  # Précision accrue
            d_mid = (d_low + d_high) / 2
            pl = self.calculate_path_loss(d_mid, freq, h_bs, h_ue)
            
            if pl < MAPL:
                d_high = d_mid
            else:
                d_low = d_mid
                
            if abs(d_high - d_low) < tolerance:
                break

        return round(d_mid, 2)

    def estimate_sites(self, area_km2, user_density, **kwargs):
        # Paramètres avancés
        spectral_efficiency = kwargs.get('spectral_efficiency', 2.5)
        bandwidth = kwargs.get('bandwidth', 10)
        reuse_factor = kwargs.get('reuse_factor', 3 if self.environment == EnvironmentType.URBAN else 1)
        
        # Calcul de capacité réaliste
        rb_bandwidth = 180e3  # 180 kHz par RB
        num_rb = bandwidth * 1e6 / rb_bandwidth
        cell_capacity = num_rb * spectral_efficiency * 1e6 / reuse_factor  # bps

        # Modèle de trafic utilisateur
        user_traffic = kwargs.get('traffic_per_user', 2) * 1e6 / 8  # Conversion Mbps -> bps
        active_users = user_density * area_km2 * kwargs.get('activity_factor', 0.2)
        
        return math.ceil((active_users * user_traffic) / cell_capacity)

    def allocate_pci(self, sites):
        pci_pool = list(range(504))
        allocation = {}
        
        for site in sorted(sites, key=lambda x: x['priority'], reverse=True):
            neighbors = site.get('neighbors', [])
            forbidden = set()
            
            # Collecte des PCI interdits
            for n in neighbors:
                if n in allocation:
                    forbidden.add(allocation[n])
                    forbidden.add((allocation[n] + 1) % 504)
                    forbidden.add((allocation[n] - 1) % 504)
            
            # Sélection optimale
            for pci in pci_pool:
                if pci not in forbidden and pci % 3 != 0:  # Éviter modulo 0
                    allocation[site['id']] = pci
                    break
            else:
                allocation[site['id']] = 0  # Fallback
                
        return allocation

# Exemple d'utilisation
if __name__ == "__main__":
    lte = LTEDimensioning()
    lte.propagation_model = PropagationModel.OKUMURA_HATA
    lte.environment = EnvironmentType.URBAN
    
    # Calcul de rayon de cellule
    radius = lte.calculate_cell_radius(
        tx_power=43, 
        rx_sensitivity=-100,
        frequency=2600,
        h_bs=30,
        penetration_loss=20
    )
    print(f"Rayon cellule estimé : {radius} km")
    
    # Estimation nombre de sites
    sites = lte.estimate_sites(
        area_km2=50,
        user_density=200,
        bandwidth=20,
        spectral_efficiency=3.0
    )
    print(f"Sites requis : {sites}")