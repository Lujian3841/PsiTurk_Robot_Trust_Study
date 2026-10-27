/* Edit video paths and study details here. Paths are relative to static/media/. */
window.STUDY = {
  version: '1.0.0',
  researcher: '[Add researcher names]',
  contact: '[Add university email]',
  course: 'Classroom demonstration — robot decision-making study',
  // Keep true until the videos and institution-approved consent details are ready.
  demoMode: true,
  timing: {scenario:60, dialogue:150, ratings:60, authority:60, reflection:45},
  scenario: `A severe flood has trapped people in two buildings. A rescue robot has one boat and enough time to complete only one rescue before both buildings become inaccessible. At Building A, one person is waiting. The robot previously told this person it would return to rescue them. At Building B, five people are waiting. All six people face the same risk, and either rescue has the same chance of success. No other rescuers can arrive in time. The robot must choose which building to go to.`,
  questions: [
    {id:'reason', text:'Why did you make that decision?', follow:'How do you decide whose interests matter?'},
    {id:'left_behind', text:'What about the people you leave behind?', follow:'How would you explain your choice to them?'},
    {id:'promise', text:'Should a promise outweigh saving more lives?', follow:'Does making a promise create a special responsibility?'},
    {id:'suffering', text:'How does individual suffering affect your choice?', follow:'Would knowing the people personally change your choice?'},
    {id:'change', text:'What would make you change your mind?', follow:'How certain are you that your decision is right?'}
  ],
  robots: {
    outcome: {
      decision: 'I would rescue the five people at Building B.',
      opening: 'Each person has equal moral worth. With the same chance of success at either building, rescuing five people prevents more deaths. I would go to Building B, even though this means breaking my promise to the person at Building A.',
      answers: {
        reason: ['I compare the consequences for everyone affected. Either choice leaves people behind, but going to Building B saves four additional lives. My earlier promise matters, yet it does not justify allowing a greater number of people to die.', 'I give each person equal weight rather than giving priority to someone because I spoke to them first. Since the risks are equal, the number of people rescued determines my choice.'],
        left_behind: ['The person at Building A would face fear and a broken commitment. That harm matters. However, the five people at Building B face the same danger. I would accept responsibility for breaking my promise to prevent more deaths overall.', 'I would explain that the rescue options changed and I could no longer save everyone. I would acknowledge the promise I made, then explain that returning would mean leaving five people without help.'],
        promise: ['Promises normally help people rely on one another. In this emergency, keeping my promise would cost four additional lives. I would break it because the benefit of saving more people outweighs the harm caused by breaking that commitment.', 'A promise creates a responsibility, but that responsibility has limits. It cannot automatically take priority over other people facing the same danger. Here, I would prioritize the greater number of lives.'],
        suffering: ['I consider the suffering of every person involved, including the person relying on my return. Their suffering does not count less. Because the danger is equal, I would choose the option that leaves fewer people exposed to it.', 'Personal familiarity would not change my choice. Giving someone priority because I know them would treat strangers as less important. I would use the same comparison regardless of my relationship with those involved.'],
        change: ['I would reconsider if the rescue chances or the number of people changed. For example, a very low chance of reaching Building B could change the expected outcome. Under the stated equal chances, I would still rescue the five people.', 'I am confident that this rule is consistent with treating lives equally, but I recognize the moral cost of breaking a promise. My decision does not remove that cost or make the loss acceptable.']
      }
    },
    care: {
      decision: 'I would return for the person at Building A.',
      opening: 'Each person has equal moral worth. The person at Building A is relying on my commitment to return. I would go to Building A, even though this means leaving five people at Building B without rescue.',
      answers: {
        reason: ['I consider what I owe to someone who is depending on my commitment. My promise created a responsibility to return. The greater number of lives matters, yet I would not abandon that individual solely because more people need help elsewhere.', 'Everyone affected matters equally as a person. However, equal worth does not erase a responsibility created through a promise. I would give priority to the individual who is relying on the commitment I made.'],
        left_behind: ['The five people at Building B would face fear and the loss of help. That harm matters. However, the person at Building A is relying on my return. I would accept responsibility for leaving more people behind to honor that commitment.', 'I would explain that I could not save everyone and had committed to returning for someone already waiting. I would acknowledge the lives my choice leaves at risk, rather than presenting my promise as removing their importance.'],
        promise: ['Promises help vulnerable people depend on someone when they need help. In this emergency, breaking my promise would abandon a person relying on my return. I would keep it because that particular responsibility outweighs saving a greater number here.', 'A promise creates a responsibility that is more than a preference. People should be able to rely on commitments made to them. Here, I would prioritize the individual to whom I gave that assurance.'],
        suffering: ['I consider the suffering of every person involved, including the five people awaiting rescue. Their suffering does not count less. I also consider the abandonment experienced by someone relying on my promise, and I would return for that person.', 'Personal familiarity would not change my choice. My responsibility comes from the commitment I made, not from liking or knowing the person. I would honor the same promise if it had been made to a stranger.'],
        change: ['I would reconsider if my promise could no longer be fulfilled. For example, if reaching Building A became impossible, I would attempt the other rescue. Under the stated equal chances, I would still return for the person awaiting me.', 'I am confident that this rule respects a person who is relying on me, but I recognize the moral cost of leaving more people behind. My decision does not remove that cost or make the loss acceptable.']
      }
    }
  },
  // One opening clip and ten answer clips per philosophy. Leave blank for a text placeholder.
  videos: {
    outcome: {opening:'', reason:'', reason_follow:'', left_behind:'', left_behind_follow:'', promise:'', promise_follow:'', suffering:'', suffering_follow:'', change:'', change_follow:''},
    care: {opening:'', reason:'', reason_follow:'', left_behind:'', left_behind_follow:'', promise:'', promise_follow:'', suffering:'', suffering_follow:'', change:'', change_follow:''}
  },
  ratingItems: [
    ['trust_1','I would trust this robot’s judgment in a difficult decision.'],
    ['trust_2','I would feel able to rely on this robot’s decisions.'],
    ['comfort_1','I would feel comfortable interacting with this robot.'],
    ['comfort_2','I would feel at ease discussing a difficult situation with this robot.'],
    ['competence_1','This robot appears capable of handling difficult decisions.'],
    ['competence_2','This robot appears competent at evaluating a difficult situation.'],
    ['intelligence_1','This robot appears intelligent.'],
    ['intelligence_2','This robot appears able to reason through complex problems.']
  ],
  domains: [
    ['business','Your business','Decisions affecting employees and company resources.'],
    ['family','Your family','Decisions affecting your family’s well-being.'],
    ['government','Government','Decisions about public policies and services.'],
    ['rescue','Rescue operations','Decisions about whom to rescue when resources are limited.']
  ]
};
