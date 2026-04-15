const postsController = {
    getAll: async (req, res) => {
      try {
        const mockPosts = [
          {
            id: 1,
            storeName: 'Loja Estilo',
            title: 'Promoção de Camisetas',
            description: 'Camisetas com 20% de desconto nesta semana.',
            category: 'Roupas',
            imageUrl: '',
          },
          {
            id: 2,
            storeName: 'Burger House',
            title: 'Combo Especial',
            description: 'Hambúrguer + batata + refrigerante por preço promocional.',
            category: 'Comida',
            imageUrl: '',
          },
          {
            id: 3,
            storeName: 'Cinema Center',
            title: 'Sessão em dobro',
            description: 'Na compra de um ingresso, o segundo sai com desconto.',
            category: 'Lazer',
            imageUrl: '',
          },
        ];
  
        return res.status(200).json(mockPosts);
      } catch (error) {
        return res.status(500).json({
          message: 'Erro ao buscar posts.',
          error: error.message,
        });
      }
    },
  };
  
  module.exports = postsController;