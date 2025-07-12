export const curriculumData = {
  gradesCurriculares: [
    {
      universidade: "Universidade Federal do Exemplo",
      polo: "Natal",
      curso: "Engenharia Civil",
      disciplinas: [
        {
          id: "1",
          nome: "Introdução à Engenharia",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "2",
          nome: "Cálculo I",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "3",
          nome: "Física I",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "4",
          nome: "Álgebra Linear",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "5",
          nome: "Cálculo II",
          periodo: 2,
          preRequisitos: ["2"],
        },
        {
          id: "6",
          nome: "Física II",
          periodo: 2,
          preRequisitos: ["3"],
        },
        {
          id: "7",
          nome: "Geometria Analítica",
          periodo: 2,
          preRequisitos: ["4"],
        },
        {
          id: "8",
          nome: "Química Geral",
          periodo: 2,
          preRequisitos: [],
        },
        {
          id: "9",
          nome: "Estruturas I",
          periodo: 3,
          preRequisitos: ["5", "6"],
        },
        {
          id: "10",
          nome: "Materiais de Construção",
          periodo: 3,
          preRequisitos: ["8"],
        },
      ],
    },
    {
      universidade: "Universidade Federal do Exemplo",
      polo: "Mossoró",
      curso: "Engenharia Civil",
      disciplinas: [
        {
          id: "1",
          nome: "Introdução à Engenharia",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "2",
          nome: "Cálculo I",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "3",
          nome: "Desenho Técnico",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "4",
          nome: "Física I",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "5",
          nome: "Cálculo II",
          periodo: 2,
          preRequisitos: ["2"],
        },
        {
          id: "6",
          nome: "Topografia I",
          periodo: 2,
          preRequisitos: ["3"],
        },
        {
          id: "7",
          nome: "Física II",
          periodo: 2,
          preRequisitos: ["4"],
        },
        {
          id: "8",
          nome: "Mecânica dos Solos",
          periodo: 3,
          preRequisitos: ["5", "7"],
        },
      ],
    },
    {
      universidade: "Universidade Particular do Exemplo",
      polo: "Caicó",
      curso: "Direito",
      disciplinas: [
        {
          id: "1",
          nome: "Introdução ao Direito",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "2",
          nome: "Teoria do Estado",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "3",
          nome: "Sociologia Jurídica",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "4",
          nome: "Direito Constitucional I",
          periodo: 2,
          preRequisitos: ["2"],
        },
        {
          id: "5",
          nome: "Direito Civil I",
          periodo: 2,
          preRequisitos: ["1"],
        },
        {
          id: "6",
          nome: "Direito Penal I",
          periodo: 2,
          preRequisitos: ["1"],
        },
        {
          id: "7",
          nome: "Direito Constitucional II",
          periodo: 3,
          preRequisitos: ["4"],
        },
        {
          id: "8",
          nome: "Direito Civil II",
          periodo: 3,
          preRequisitos: ["5"],
        },
      ],
    },
    {
      universidade: "Universidade Federal do Exemplo",
      polo: "Natal",
      curso: "Computação",
      disciplinas: [
        {
          id: "1",
          nome: "Introdução à Computação",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "2",
          nome: "Cálculo I",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "3",
          nome: "Álgebra Linear",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "4",
          nome: "Lógica Matemática",
          periodo: 1,
          preRequisitos: [],
        },
        {
          id: "5",
          nome: "Algoritmos e Estruturas de Dados",
          periodo: 2,
          preRequisitos: ["1"],
        },
        {
          id: "6",
          nome: "Cálculo II",
          periodo: 2,
          preRequisitos: ["2"],
        },
        {
          id: "7",
          nome: "Programação I",
          periodo: 2,
          preRequisitos: ["1"],
        },
        {
          id: "8",
          nome: "Programação II",
          periodo: 3,
          preRequisitos: ["7", "5"],
        },
        {
          id: "9",
          nome: "Banco de Dados I",
          periodo: 3,
          preRequisitos: ["5"],
        },
      ],
    },
  ],
}

export const universities = [
  "Universidade Federal do Exemplo",
  "Universidade Particular do Exemplo",
  "Instituto Federal do Exemplo",
  "Universidade Estadual do Exemplo",
]

export const cities = ["Natal", "Mossoró", "Caicó", "Parnamirim", "São Gonçalo do Amarante"]

export const courses = [
  "Engenharia Civil",
  "Direito",
  "Medicina",
  "Administração",
  "Computação",
  "Psicologia",
  "Arquitetura",
  "Enfermagem",
]
