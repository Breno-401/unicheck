# UniMatch — escopo do motor próprio

## Objetivo

Integrar uma ferramenta pública de busca de possíveis correspondências curriculares ao UniCheck, com rota `/unimatch`, acesso pela navegação/landing e endpoints próprios em Netlify Functions. O visual e a arquitetura seguem o HTML, CSS e JavaScript vanilla já usados pelo projeto.

## Limite em relação ao portal de referência

O fluxo público do portal foi inspecionado. Seu JavaScript acessível coleta/normaliza entradas e apresenta a resposta, mas o cálculo e o resumo são processados no servidor; não foi possível recuperar o algoritmo real pelos recursos públicos do navegador. O UniCheck não chamará os endpoints daquele portal.

O motor desta implementação é uma ferramenta nova, independente e explicável. Ele ranqueia disciplinas por semelhança textual e conceitual a partir de normalização em português, vocabulário controlado de termos relacionados e dados curriculares públicos. Não representa uma cópia ou validação do resultado do portal original e não decide aproveitamento acadêmico.

## Fontes e regras

- O catálogo oficial de cursos e modalidades deve vir de [unisales.br/graduacao](https://unisales.br/graduacao/).
- Cada registro curricular deve guardar curso, modalidade/versão quando publicada, nome oficial da disciplina, carga horária somente se publicada, URL da fonte e ano de publicação. Dados ausentes permanecem `null`; não se inferem ementas, carga horária, período nem versão.
- O catálogo local contém 21 matrizes distribuídas por 16 formações: Administração, Arquitetura e Urbanismo, Biomedicina, Ciências Contábeis, Direito, Educação Física (bacharelado e licenciatura), Enfermagem, Engenharia de Software, Farmácia, Filosofia, Fisioterapia, Nutrição, Psicologia, Sistemas de Informação e Tecnologia em Análise e Desenvolvimento de Sistemas. As versões registradas vão de 2022 a 2024; há modalidades distintas apenas nos documentos que as identificam. Os registros contêm 1.018 nomes de componentes contando repetições entre matrizes. Cada opção mantém sua fonte oficial; a interface informa quando a modalidade não aparece na fonte.
- Os PDFs curriculares localizados publicam nomes de componentes, mas não as ementas ou a carga horária individual usada pelo motor. Por isso, todos os valores de carga horária de destino permanecem `null` e nenhuma ementa de destino foi inventada. O usuário pode fornecer sua ementa de origem, que será comparada apenas com os nomes oficiais disponíveis.
- O [Regimento UniSales de 2021](https://unisales.br/wp-content/uploads/2021/12/UNISALES_RES-resolucao-10-2021_homologa-res-07-2021-regimento-unisales.pdf) registra compatibilidade de conteúdo/carga horária e exige, para análise formal, carga horária de origem de ao menos 75% da disciplina de destino. O regimento também limita o aproveitamento total a 50% da carga do curso e atribui a decisão à coordenação. A aplicação pode sinalizar o critério de 75% apenas quando ambas as cargas oficiais estão disponíveis; esse sinal não é aprovação.
- O [edital UniSales 2026/1](https://unisales.br/wp-content/uploads/2025/11/Edital-Processo-Seletivo-2026-1.pdf) solicita ementa/plano de ensino para a avaliação institucional. A interface deve recomendar a conferência formal pela instituição.

## Contrato funcional do motor

- Entrada: curso/modalidade UniSales de destino; uma ou mais disciplinas de origem com nome, carga horária opcional e descrição/ementa opcional.
- Preparação: normalização Unicode/acentos, tokenização e redução simples de plurais em português, remoção de palavras funcionais/gêneros curriculares e expansão por 45 grupos de conceitos mantidos em código. Os grupos cobrem dados/software, gestão/economia, direito, saúde, comportamento, arquitetura, ambiente, educação, filosofia e outras áreas presentes nas matrizes.
- Comparação: ranqueamento determinístico por sobreposição de termos e conceitos contra os nomes publicados para o destino. Relações amplas como banco de dados/análise de dados também exigem ao menos um termo lexical comum; uma palavra genérica isolada não basta para produzir sugestão. Cada sugestão retorna nome e fonte oficial da disciplina, motivos legíveis, pontuação de similaridade claramente rotulada como heurística e estado do critério de carga horária (`atende`, `não atende` ou `não verificado`) apenas quando as duas cargas estiverem disponíveis.
- A pontuação mede sobreposição dentro desta heurística; não é probabilidade de aprovação. O motor não usa serviço externo/LLM, não acessa os endpoints do portal de referência e não reproduz o algoritmo do portal. Como os alvos só têm nomes de disciplinas, a precisão está limitada pela ausência de ementas de destino e ainda precisa de revisão acadêmica.
- Saída: sugestões ordenadas para análise humana. Não retornar `aprovada`, `equivalente` como decisão, probabilidade de aprovação, percentual de aproveitamento oficial nem matriz inexistente.
- Na cobertura atual, a carga horária de destino nunca está publicada nos dados importados; portanto, a regra formal de 75% não pode ser calculada na experiência atual e é sempre explicada como não verificada. A regra de limite total de 50% também não é calculada porque faltam cargas horárias completas de destino.
- Cobertura parcial de documentos e matrizes sem ementas/carga horária deve ser mostrada ao usuário. Uma ausência no catálogo ou nas sugestões não significa ausência de equivalência.

## Validação

Os testes de unidade fixam comportamento verificável da heurística, como normalização de acentos, aliases em domínios diferentes, redução de ruído genérico, ordenação, casos sem relação e cargas desconhecidas. Eles testam a API própria e os elementos de navegação. Esses testes não demonstram paridade com o portal original. A aplicação só poderá alegar fidelidade a esse portal se forem obtidos casos autorizados de referência e os resultados forem comparados; por enquanto ela é explicitamente uma ferramenta própria de sugestão.
