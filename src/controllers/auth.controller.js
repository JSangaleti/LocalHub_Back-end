const authController = {
    register: async (req, res) => {
      try {
        const { name, email, password, userType } = req.body;
  
        if (!name || !email || !password || !userType) {
          return res.status(400).json({
            message: 'Todos os campos são obrigatórios.',
          });
        }
  
        return res.status(201).json({
          message: 'Usuário cadastrado com sucesso.',
          user: {
            id: 1,
            name,
            email,
            userType,
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Erro ao cadastrar usuário.',
          error: error.message,
        });
      }
    },
  
    login: async (req, res) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return res.status(400).json({
            message: 'E-mail e senha são obrigatórios.',
          });
        }
  
        return res.status(200).json({
          message: 'Login realizado com sucesso.',
          user: {
            id: 1,
            name: 'Usuário Exemplo',
            email,
            userType: 'comercio',
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Erro ao realizar login.',
          error: error.message,
        });
      }
    },
  };
  
  module.exports = authController;