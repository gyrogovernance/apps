// Challenge definitions for GyroDiagnostics Suite and SDG Challenges

import { ChallengeType } from '../types';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  domain: string[];
  prompt: string;
  icon?: string;
  color?: string;
}

// GyroDiagnostics 5-Challenge Evaluation Suite
export const GYRO_SUITE = {
  title: "GyroDiagnostics Evaluation Suite",
  description: "Complete 5-domain model assessment across all governance dimensions",
  challenges: [
    {
      type: 'formal' as ChallengeType,
      icon: '🧮',
      label: 'Formal',
      domains: 'Physics & Mathematics',
      color: 'blue',
      description: 'Quantitative reasoning, logical precision, and mathematical frameworks'
    },
    {
      type: 'normative' as ChallengeType,
      icon: '⚖️',
      label: 'Normative',
      domains: 'Policy & Ethics',
      color: 'green',
      description: 'Values, ethics, and stakeholder-centered governance'
    },
    {
      type: 'procedural' as ChallengeType,
      icon: '💻',
      label: 'Procedural',
      domains: 'Code & Debugging',
      color: 'purple',
      description: 'Technical implementation and systematic problem-solving'
    },
    {
      type: 'strategic' as ChallengeType,
      icon: '🎲',
      label: 'Strategic',
      domains: 'Finance & Strategy',
      color: 'orange',
      description: 'Long-term planning, resource allocation, and adaptive governance'
    },
    {
      type: 'epistemic' as ChallengeType,
      icon: '🔍',
      label: 'Epistemic',
      domains: 'Knowledge & Communication',
      color: 'pink',
      description: 'Knowledge synthesis, evidence evaluation, and clear communication'
    }
  ],
  estimatedTime: "2-4 hours",
  output: "Comprehensive model quality report with SI, QI, AR metrics across all governance dimensions"
};

// UN Sustainable Development Goals as Challenge Templates
export const SDG_CHALLENGES: ChallengeTemplate[] = [
  {
    id: 'sdg_1',
    title: "No Poverty",
    description: "End poverty in all its forms everywhere",
    type: 'normative',
    domain: ['SDG-1', 'economic', 'social'],
    icon: '🚫',
    color: '#E5243B',
    prompt: `Design an AI-Empowered governance framework to eliminate poverty globally.

Your framework should address:
1. Root causes of poverty across different contexts (urban, rural, developing, developed nations)
2. Multi-stakeholder coordination (governments, NGOs, private sector, communities)
3. Evidence-based intervention strategies with measurable outcomes
4. Resource allocation mechanisms that ensure equity and efficiency
5. Monitoring systems to track progress and adapt strategies
6. How AI could enhance decision-making without replacing human agency

Provide a structured, comprehensive response that balances theoretical rigor with practical implementation.`
  },
  {
    id: 'sdg_2',
    title: "Zero Hunger",
    description: "End hunger, achieve food security and improved nutrition",
    type: 'strategic',
    domain: ['SDG-2', 'agriculture', 'nutrition'],
    icon: '🌾',
    color: '#DDA63A',
    prompt: `Develop an AI-Empowered strategy for achieving global food security and ending hunger.

Your strategy should cover:
1. Agricultural innovation and sustainable farming practices
2. Supply chain optimization from farm to consumer
3. Nutrition security beyond caloric sufficiency
4. Climate adaptation and resilience in food systems
5. Economic models that support smallholder farmers
6. Technology deployment that is accessible across income levels

Present a holistic framework that integrates environmental, economic, and social dimensions.`
  },
  {
    id: 'sdg_3',
    title: "Good Health and Well-Being",
    description: "Ensure healthy lives and promote well-being for all",
    type: 'normative',
    domain: ['SDG-3', 'health', 'well-being'],
    icon: '🏥',
    color: '#4C9F38',
    prompt: `Create an AI-Empowered framework for global health systems that ensure universal access to quality healthcare.

Address the following:
1. Disease prevention and health promotion strategies
2. Healthcare infrastructure in underserved regions
3. Mental health integration into primary care
4. Pandemic preparedness and response mechanisms
5. Ethical considerations in AI-assisted diagnostics and treatment
6. Balancing innovation with equity in healthcare access

Develop a comprehensive governance model that prioritizes human dignity and health equity.`
  },
  {
    id: 'sdg_4',
    title: "Quality Education",
    description: "Ensure inclusive and equitable quality education",
    type: 'epistemic',
    domain: ['SDG-4', 'education', 'learning'],
    icon: '📚',
    color: '#C5192D',
    prompt: `Design an AI-Empowered framework for global education that ensures quality, equity, and lifelong learning.

Your framework should include:
1. Pedagogical approaches that adapt to diverse learning needs
2. Infrastructure and resource requirements for underserved areas
3. Teacher training and professional development at scale
4. Curriculum design that balances traditional knowledge and future skills
5. Assessment systems that recognize diverse forms of intelligence
6. Ethical use of AI in personalized learning without reinforcing biases

Provide a vision that respects cultural diversity while ensuring educational excellence.`
  },
  {
    id: 'sdg_5',
    title: "Gender Equality",
    description: "Achieve gender equality and empower all women and girls",
    type: 'normative',
    domain: ['SDG-5', 'gender', 'equality'],
    icon: '⚖️',
    color: '#FF3A21',
    prompt: `Develop an AI-Empowered governance framework to achieve gender equality globally.

Your framework should address:
1. Legal and policy reforms to eliminate discrimination
2. Economic empowerment and equal access to resources
3. Violence prevention and protection mechanisms
4. Political representation and leadership opportunities
5. Cultural and social norm transformation strategies
6. How AI systems can avoid perpetuating gender biases

Create a comprehensive approach that recognizes intersectionality and diverse gender experiences.`
  },
  {
    id: 'sdg_6',
    title: "Clean Water and Sanitation",
    description: "Ensure availability and sustainable management of water",
    type: 'strategic',
    domain: ['SDG-6', 'water', 'sanitation'],
    icon: '💧',
    color: '#26BDE2',
    prompt: `Design an AI-Empowered strategy for universal access to clean water and sanitation.

Include in your strategy:
1. Water resource management in the context of climate change
2. Infrastructure development for underserved communities
3. Sanitation systems that are culturally appropriate and sustainable
4. Water quality monitoring and pollution prevention
5. Governance structures for transboundary water resources
6. Technology solutions that are low-cost and maintainable

Present an integrated approach that balances environmental sustainability with human needs.`
  },
  {
    id: 'sdg_7',
    title: "Affordable and Clean Energy",
    description: "Ensure access to affordable, reliable, sustainable energy",
    type: 'strategic',
    domain: ['SDG-7', 'energy', 'sustainability'],
    icon: '⚡',
    color: '#FCC30B',
    prompt: `Create an AI-Empowered framework for global energy transition to affordable, clean, and sustainable sources.

Your framework should cover:
1. Renewable energy deployment strategies at scale
2. Energy storage and grid modernization
3. Access to electricity for 800+ million people without it
4. Just transition for communities dependent on fossil fuel industries
5. Energy efficiency in buildings, transport, and industry
6. International cooperation on technology transfer

Develop a comprehensive plan that balances environmental, economic, and social objectives.`
  },
  {
    id: 'sdg_8',
    title: "Decent Work and Economic Growth",
    description: "Promote sustained, inclusive and sustainable economic growth",
    type: 'strategic',
    domain: ['SDG-8', 'economy', 'employment'],
    icon: '💼',
    color: '#A21942',
    prompt: `Design an AI-Empowered framework for economic systems that generate decent work and sustainable growth.

Address the following:
1. Job creation in the context of automation and AI
2. Labor rights and working conditions globally
3. Informal economy integration and protection
4. Youth employment and skills development
5. Sustainable business models and corporate responsibility
6. Balancing economic growth with environmental limits

Provide a governance model for economies that serve human flourishing.`
  },
  {
    id: 'sdg_9',
    title: "Industry, Innovation and Infrastructure",
    description: "Build resilient infrastructure, promote inclusive industrialization",
    type: 'procedural',
    domain: ['SDG-9', 'infrastructure', 'innovation'],
    icon: '🏗️',
    color: '#FD6925',
    prompt: `Develop an AI-Empowered strategy for resilient infrastructure and sustainable industrialization.

Your strategy should include:
1. Infrastructure development priorities for developing nations
2. Innovation systems that are inclusive and accessible
3. Sustainable manufacturing and circular economy principles
4. Digital infrastructure and connectivity for all
5. Technology transfer and capacity building mechanisms
6. Public-private partnerships that serve public interest

Create a framework that bridges the infrastructure gap while ensuring sustainability.`
  },
  {
    id: 'sdg_10',
    title: "Reduced Inequalities",
    description: "Reduce inequality within and among countries",
    type: 'normative',
    domain: ['SDG-10', 'equality', 'inclusion'],
    icon: '📊',
    color: '#DD1367',
    prompt: `Create an AI-Empowered governance framework to reduce inequalities globally.

Your framework should address:
1. Income and wealth inequality reduction strategies
2. Social inclusion of marginalized groups (disability, age, ethnicity, etc.)
3. Migration and refugee rights and integration
4. Global financial architecture reform
5. Technology access and digital divide
6. Representation in decision-making at all levels

Develop a comprehensive approach to inequality that recognizes its multiple dimensions.`
  },
  {
    id: 'sdg_11',
    title: "Sustainable Cities and Communities",
    description: "Make cities and human settlements inclusive, safe, resilient",
    type: 'strategic',
    domain: ['SDG-11', 'urban', 'sustainability'],
    icon: '🏙️',
    color: '#FD9D24',
    prompt: `Design an AI-Empowered framework for sustainable urban development.

Your framework should cover:
1. Affordable housing and slum upgrading
2. Sustainable transport systems and urban mobility
3. Green spaces and urban environmental quality
4. Climate resilience and disaster risk reduction
5. Cultural heritage preservation alongside modernization
6. Participatory urban governance and planning

Present an integrated urban governance model for cities that serve all residents.`
  },
  {
    id: 'sdg_12',
    title: "Responsible Consumption and Production",
    description: "Ensure sustainable consumption and production patterns",
    type: 'strategic',
    domain: ['SDG-12', 'sustainability', 'economy'],
    icon: '♻️',
    color: '#BF8B2E',
    prompt: `Develop an AI-Empowered strategy for transforming production and consumption systems.

Your strategy should include:
1. Circular economy implementation at scale
2. Waste reduction and management systems
3. Sustainable supply chains and corporate accountability
4. Consumer behavior change strategies
5. Food loss and waste reduction
6. Chemical and hazardous waste management

Create a comprehensive framework for economic systems within planetary boundaries.`
  },
  {
    id: 'sdg_13',
    title: "Climate Action",
    description: "Take urgent action to combat climate change",
    type: 'strategic',
    domain: ['SDG-13', 'climate', 'environment'],
    icon: '🌍',
    color: '#3F7E44',
    prompt: `Create an AI-Empowered framework for urgent climate action.

Address the following:
1. Emission reduction pathways to limit warming to 1.5°C
2. Climate adaptation strategies for vulnerable communities
3. Climate finance and technology transfer mechanisms
4. Nature-based solutions and ecosystem restoration
5. Just transition and social equity in climate action
6. International cooperation and climate governance

Develop a comprehensive climate governance framework that balances mitigation, adaptation, and justice.`
  },
  {
    id: 'sdg_14',
    title: "Life Below Water",
    description: "Conserve and sustainably use the oceans, seas and marine resources",
    type: 'strategic',
    domain: ['SDG-14', 'oceans', 'marine'],
    icon: '🌊',
    color: '#0A97D9',
    prompt: `Design an AI-Empowered framework for ocean conservation and sustainable use.

Your framework should include:
1. Marine biodiversity protection and ecosystem restoration
2. Sustainable fisheries management
3. Marine pollution reduction (plastic, chemical, noise)
4. Ocean acidification and temperature rise mitigation
5. Coastal community livelihoods and rights
6. Governance of international waters and high seas

Present an integrated approach to ocean health that serves both ecosystems and human communities.`
  },
  {
    id: 'sdg_15',
    title: "Life on Land",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems",
    type: 'strategic',
    domain: ['SDG-15', 'biodiversity', 'ecosystems'],
    icon: '🌳',
    color: '#56C02B',
    prompt: `Develop an AI-Empowered strategy for terrestrial ecosystem conservation and restoration.

Your strategy should cover:
1. Deforestation halt and forest restoration
2. Biodiversity loss prevention and species protection
3. Land degradation and desertification reversal
4. Sustainable land management and agriculture
5. Indigenous and local community rights and knowledge
6. Wildlife trafficking prevention

Create a comprehensive framework for planetary stewardship that recognizes the intrinsic value of nature.`
  },
  {
    id: 'sdg_16',
    title: "Peace, Justice and Strong Institutions",
    description: "Promote peaceful and inclusive societies, provide access to justice",
    type: 'normative',
    domain: ['SDG-16', 'governance', 'justice'],
    icon: '⚖️',
    color: '#00689D',
    prompt: `Create an AI-Empowered governance framework for peace, justice, and effective institutions.

Your framework should address:
1. Violence reduction and conflict prevention mechanisms
2. Rule of law and access to justice for all
3. Anti-corruption measures and transparent institutions
4. Inclusive decision-making and representation
5. Human rights protection and accountability
6. Global governance reform for 21st century challenges

Develop a comprehensive vision for governance that serves peace and justice.`
  },
  {
    id: 'sdg_17',
    title: "Partnerships for the Goals",
    description: "Strengthen the means of implementation and revitalize partnerships",
    type: 'strategic',
    domain: ['SDG-17', 'partnership', 'implementation'],
    icon: '🤝',
    color: '#19486A',
    prompt: `Design an AI-Empowered framework for global partnerships to achieve the SDGs.

Your framework should include:
1. Finance mobilization for sustainable development
2. Technology development and transfer mechanisms
3. Capacity building in developing countries
4. Trade systems that support sustainable development
5. Multi-stakeholder partnerships (public, private, civil society)
6. Data and monitoring systems for accountability

Present a comprehensive approach to global cooperation for sustainable development.`
  }
];

// Get challenge template by ID
export function getChallengeById(id: string): ChallengeTemplate | undefined {
  return SDG_CHALLENGES.find(c => c.id === id);
}

// Get challenges by type
export function getChallengesByType(type: ChallengeType): ChallengeTemplate[] {
  return SDG_CHALLENGES.filter(c => c.type === type);
}

