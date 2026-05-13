import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';

@Injectable()
export class CepService {
  private readonly logger = new Logger(CepService.name);

  async fetchAddress(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new BadRequestException('CEP inválido. Deve conter 8 dígitos.');
    }

    // Provedores em ordem de prioridade
    const providers = [
      {
        name: 'BrasilAPI',
        url: `https://brasilapi.com.br/api/cep/v1/${cleanCep}`,
        map: (data: any) => ({
          zip: data.cep,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          complement: '',
        })
      },
      {
        name: 'ViaCEP',
        url: `https://viacep.com.br/ws/${cleanCep}/json/`,
        map: (data: any) => {
          if (data.erro) return null;
          return {
            zip: data.cep,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            complement: data.complemento,
          };
        }
      }
    ];

    for (const provider of providers) {
      try {
        this.logger.log(`Tentando buscar CEP ${cleanCep} via ${provider.name}...`);
        
        const response = await fetch(provider.url, {
          headers: {
            'User-Agent': 'ClinicManagementApp/1.0 (contact@example.com)'
          }
        });
        
        this.logger.log(`${provider.name} respondeu com status ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          this.logger.log(`${provider.name} retornou dados: ${JSON.stringify(data)}`);
          
          const mapped = provider.map(data);
          if (mapped) {
            this.logger.log(`CEP ${cleanCep} mapeado com sucesso via ${provider.name}`);
            return mapped;
          } else {
            this.logger.warn(`${provider.name} retornou dados inválidos ou 'não encontrado' para o CEP ${cleanCep}`);
          }
        } else {
          const errorText = await response.text();
          this.logger.warn(`${provider.name} falhou: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        this.logger.error(`Erro de rede ao conectar com ${provider.name}: ${err.message}`);
      }
    }

    throw new NotFoundException(`O CEP ${cleanCep} não foi encontrado em nenhum dos nossos provedores. Verifique se o número está correto.`);
  }
}
