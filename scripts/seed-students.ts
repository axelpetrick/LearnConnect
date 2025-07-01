import { db } from '../server/db';
import { users, forumTopics, forumComments, topicVotes, commentVotes } from '../shared/schema';
import bcrypt from 'bcrypt';

const studentNames = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Pereira',
  'Lucia Ferreira', 'Rafael Almeida', 'Camila Rodrigues', 'Bruno Martins', 'Juliana Lima',
  'Felipe Sousa', 'Beatriz Gomes', 'Gabriel Ribeiro', 'Isabella Carvalho', 'Mateus Barbosa'
];

const discussionTopics = [
  { title: 'Como melhorar as notas em Matemática?', content: 'Gostaria de dicas de estudo para melhorar meu desempenho em cálculo.' },
  { title: 'Dúvidas sobre programação em Python', content: 'Estou com dificuldades para entender loops e funções. Alguém pode ajudar?' },
  { title: 'Metodologias de estudo eficazes', content: 'Quais são as melhores técnicas de memorização e organização?' },
  { title: 'Preparação para provas', content: 'Como vocês se organizam para estudar para múltiplas provas?' },
  { title: 'Projetos em grupo', content: 'Dicas para trabalhar bem em equipe nos projetos da faculdade?' },
  { title: 'Estágio vs Estudos', content: 'Como equilibrar estágio e estudos? Vale a pena estagiar cedo?' },
  { title: 'Ferramentas de produtividade', content: 'Quais apps/sites vocês usam para se organizar nos estudos?' },
  { title: 'Dificuldades em Física', content: 'Alguém tem dicas para entender melhor mecânica clássica?' },
  { title: 'Inglês técnico', content: 'Como melhorar o inglês para ler artigos científicos?' },
  { title: 'Ansiedade nas provas', content: 'Como lidar com nervosismo durante avaliações importantes?' },
  { title: 'Carreira acadêmica', content: 'Vale a pena seguir mestrado logo após a graduação?' },
  { title: 'Networking estudantil', content: 'Como fazer conexões importantes ainda na universidade?' },
  { title: 'Recursos gratuitos de estudo', content: 'Compartilhem sites e materiais gratuitos de qualidade!' },
  { title: 'Organização de tempo', content: 'Como vocês dividem o tempo entre diferentes matérias?' },
  { title: 'Motivação nos estudos', content: 'Como manter a motivação durante períodos difíceis?' },
  { title: 'Técnicas de redação', content: 'Dicas para escrever trabalhos acadêmicos de qualidade?' },
  { title: 'Laboratórios práticos', content: 'Como aproveitar melhor as aulas práticas?' },
  { title: 'Bolsas de estudo', content: 'Informações sobre bolsas e auxílios disponíveis?' },
  { title: 'Intercâmbio acadêmico', content: 'Experiências e dicas sobre programas de intercâmbio?' },
  { title: 'Vida universitária', content: 'Como aproveitar ao máximo a experiência universitária?' },
  { title: 'Tecnologia nos estudos', content: 'Melhores ferramentas digitais para potencializar o aprendizado?' },
  { title: 'Grupo de estudos', content: 'Como formar e manter grupos de estudo produtivos?' },
  { title: 'Saúde mental', content: 'Como cuidar da saúde mental durante a graduação?' },
  { title: 'Mercado de trabalho', content: 'O que o mercado espera dos recém-formados?' },
  { title: 'Projetos pessoais', content: 'Como desenvolver projetos paralelos aos estudos?' },
  { title: 'Feedback dos professores', content: 'Como usar o feedback para melhorar o desempenho?' },
  { title: 'Palestras e eventos', content: 'Eventos acadêmicos que valem a pena participar?' },
  { title: 'Bibliografia complementar', content: 'Livros além da bibliografia obrigatória que recomendam?' },
  { title: 'Soft skills', content: 'Quais habilidades interpessoais são mais importantes?' },
  { title: 'Inovação e criatividade', content: 'Como desenvolver o pensamento criativo nos estudos?' }
];

const comments = [
  'Ótima pergunta! Eu também tenho essa dúvida.',
  'Na minha experiência, o que funciona é...',
  'Discordo um pouco dessa abordagem.',
  'Muito interessante! Nunca havia pensado nisso.',
  'Obrigado por compartilhar essa informação!',
  'Tem alguma fonte onde posso ler mais sobre isso?',
  'Concordo totalmente com sua opinião.',
  'Isso me lembrou de uma situação similar...',
  'Excelente dica! Vou testar essa estratégia.',
  'Alguém já tentou essa abordagem antes?'
];

async function seedStudents() {
  try {
    console.log('Criando 15 perfis de estudantes...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    const createdStudents = [];

    // Criar os 15 estudantes
    for (let i = 1; i <= 15; i++) {
      const fullName = studentNames[i - 1];
      const firstName = fullName.split(' ')[0].toLowerCase();
      
      const [student] = await db.insert(users).values({
        username: `aluno${i}`,
        email: `${firstName}@aluno.com`,
        password: hashedPassword,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' '),
        role: 'student'
      }).returning();
      
      createdStudents.push(student);
      console.log(`Criado estudante: ${student.username} (${student.firstName})`);
    }

    console.log('Criando discussões do fórum...');
    
    // Criar 2 discussões para cada estudante
    const createdTopics = [];
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      
      // Criar 2 tópicos por estudante
      for (let j = 0; j < 2; j++) {
        const topicIndex = (i * 2) + j;
        const topic = discussionTopics[topicIndex];
        
        const [createdTopic] = await db.insert(forumTopics).values({
          title: topic.title,
          content: topic.content,
          authorId: student.id,
          courseId: null, // Discussão geral
          tags: ['estudo', 'duvida'],
          isPinned: false,
          views: Math.floor(Math.random() * 50) + 1
        }).returning();
        
        createdTopics.push(createdTopic);
        console.log(`Criado tópico: ${createdTopic.title} por ${student.firstName}`);
      }
    }

    console.log('Adicionando comentários e interações...');
    
    // Adicionar comentários nos tópicos
    for (const topic of createdTopics) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comentários
      
      for (let i = 0; i < numComments; i++) {
        const randomStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        
        const [comment] = await db.insert(forumComments).values({
          content: randomComment,
          authorId: randomStudent.id,
          topicId: topic.id,
          parentId: null,
          votes: Math.floor(Math.random() * 10) - 3, // -3 a +6 votos
          isAnonymous: Math.random() > 0.7 // 30% chance de ser anônimo
        }).returning();

        // Adicionar alguns votos nos comentários
        if (Math.random() > 0.5) {
          const voterStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
          const voteType = Math.random() > 0.3 ? 1 : -1; // 70% chance de upvote
          
          await db.insert(commentVotes).values({
            userId: voterStudent.id,
            commentId: comment.id,
            voteType: voteType
          });
        }
      }
      
      // Adicionar votos nos tópicos
      const numTopicVotes = Math.floor(Math.random() * 8) + 1; // 1-8 votos
      for (let i = 0; i < numTopicVotes; i++) {
        const voterStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
        const voteType = Math.random() > 0.25 ? 1 : -1; // 75% chance de like
        
        try {
          await db.insert(topicVotes).values({
            userId: voterStudent.id,
            topicId: topic.id,
            voteType: voteType
          });
        } catch (error) {
          // Ignorar se o usuário já votou no tópico
        }
      }
    }

    console.log('✅ Seed completo!');
    console.log(`- ${createdStudents.length} estudantes criados`);
    console.log(`- ${createdTopics.length} tópicos criados`);
    console.log('- Comentários e votações adicionados');
    
  } catch (error) {
    console.error('Erro durante o seed:', error);
  }
}

seedStudents();