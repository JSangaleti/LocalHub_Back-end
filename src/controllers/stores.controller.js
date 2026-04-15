const storesController = {
    getById: async (req, res) => {
      try {
        const { id } = req.params;
  
        const mockStore = {
          id: Number(id),
          name: 'Loja Estilo',
          description: 'Moda casual e acessórios para o dia a dia.',
          category: 'Roupas',
          address: 'Centro, Campo Mourão - PR',
          openingHours: '08:00 às 18:00',
          contact: '(44) 99999-9999',
        };
  
        return res.status(200).json(mockStore);
      } catch (error) {
        return res.status(500).json({
          message: 'Erro ao buscar loja.',
          error: error.message,
        });
      }
    },
  };
  
  module.exports = storesController;