export type ChartView = "x" | "rumble"

export const fuentesToc = [
  { id: "method", label: "How to read this briefing" },
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Public timeline" },
  { id: "metrics", label: "Account metrics" },
  { id: "network", label: "Associated accounts and network" },
  { id: "engagement", label: "X engagement snapshot" },
  { id: "coverage", label: "Media coverage" },
  { id: "gaps", label: "Gaps and caveats" },
  { id: "sources", label: "Sources" },
] as const

export const platformBars = [
  {
    label: "X @NickJFuentes",
    value: 1317502,
    display: "1,317,502",
    meta: "Nov 14, 2026, 6:23 p.m. CT",
  },
  {
    label: "Rumble",
    value: 725690,
    display: "725,690",
    meta: "Nov 11, 2026, 12:53 p.m. CT",
  },
  {
    label: "Telegram",
    value: 112300,
    display: "112.3K",
    meta: "TG.ME display, Nov 14, 2026",
  },
  {
    label: "X @AmFirstHQ",
    value: 33981,
    display: "33,981",
    meta: "Official show account, Nov 14, 2026",
  },
] as const

export const xFollowerHistory = [
  { label: "May 2024", value: 168000 },
  { label: "Sep 2025", value: 925000 },
  { label: "Nov 2026", value: 1317502 },
] as const

export const rumbleFollowerHistory = [
  { label: "Jun 2025", value: 150000 },
  { label: "Late summer", value: 250000 },
  { label: "Nov 2025", value: 470000 },
  { label: "Dec 2025", value: 580000 },
  { label: "Apr 2026", value: 680000 },
  { label: "Oct 20, 2026", value: 711461 },
  { label: "Nov 2026", value: 725690 },
] as const

export const overviewParagraphs = [
  `Nicholas Joseph Fuentes, born August 18, 1998, in Illinois and raised in La Grange Park, is a political livestreamer and commentator who hosts the show America First. He attended Boston University briefly, left after the August 2017 Unite the Right rally in Charlottesville, and later earned an associate degree from the College of DuPage. Fuentes presents the show and movement as America First and opposed to mainstream conservative institutions.`,
  `America First with Nicholas J. Fuentes began in 2017, first on YouTube and, for a period, on Right Side Broadcasting Network. The show now streams on weeknights, typically advertised as Monday through Friday at 9 p.m. Central, with Rumble as the primary current host and Cozy.tv/Nick still listed on his Telegram channel. The America First Foundation, a 501(c)(4) formed in 2020, has been the organizational umbrella for conferences, merchandising, and related projects. Its America First Political Action Conference (AFPAC) was staged as a rival to CPAC from 2020 through 2022; a planned 2024 edition was cancelled after a venue dispute, and The New York Times reported in April 2026 that Fuentes had discontinued AFPAC over safety concerns. Racket News, citing the foundation's then-most-recent IRS filing, reported $561,822 in contributions for July 2023 through June 2024.`,
  `Groypers, also called the Groyper Army, is the name Fuentes and his supporters use for the following around America First. The term comes from a squat, smug cartoon frog related to the Pepe the Frog meme that circulated on 4chan and later on Discord and other platforms. Reporting in The New York Times, Vox, Forbes, and by the Institute for Strategic Dialogue describes the milieu as a loose, mostly young, internet-based network rather than a formal membership organization. Internet-culture writer Katherine Dee, quoted in the Times, said fealty to Fuentes is the main boundary and that the group otherwise lacks clear ideological borders. Fuentes has said he wants the number, location, and identity of supporters to remain obscure.`,
] as const

export const timelineRows: [string, string, string][] = [
  [
    "Aug 2017",
    "Attends Unite the Right in Charlottesville; leaves Boston University and Right Side Broadcasting Network shortly afterward.",
    "Chicago Tribune; Time; Media Matters",
  ],
  [
    "2017",
    "Launches the livestream America First with Nicholas J. Fuentes.",
    "ADL; Wikipedia",
  ],
  [
    "Oct–Nov 2019",
    "First Groyper War: supporters confront speakers at Turning Point USA and related events, including a Donald Trump Jr. book event that ended early.",
    "Vox, Nov 11, 2019; Washington Post, Nov 16, 2019",
  ],
  [
    "Feb 14, 2020",
    "YouTube terminates his channel for hate-speech policy violations. He moves to DLive, where Time reported he was the most-viewed livestreamer in January 2020.",
    "Daily Dot; Time",
  ],
  [
    "Feb 28, 2020",
    "First America First Political Action Conference, in Washington, D.C.",
    "Racket News, citing contemporaneous coverage",
  ],
  [
    "May 13, 2020",
    "America First Foundation is formed.",
    "Racket News, Dec 13, 2025",
  ],
  [
    "Jan 6, 2021",
    "Present on Capitol grounds during the attack; reporting says he did not enter the building. An America First flag was filmed inside. DLive permanently suspends him. The FBI later closed an investigation without charges. The House Jan. 6 committee subpoenaed him in January 2022.",
    "ProPublica; SPLC; New York Times",
  ],
  [
    "Jul 2021",
    "Twitter indefinitely suspends his verified account. Axios later also describes a December 2021 ban and an October 2022 suspension of a replacement account after Elon Musk purchased the company.",
    "Newsweek; Forbes; Mother Jones; Axios",
  ],
  [
    "Oct 2021",
    "Cozy.tv, a livestream platform Fuentes built with Alex Jones, launches.",
    "Wikipedia, citing contemporaneous reporting; WIRED",
  ],
  [
    "Dec 2021",
    "Gettr permanently suspends him and later restricts the word groyper on the platform.",
    "Daily Beast",
  ],
  [
    "Feb 2022",
    "AFPAC III features remarks from Rep. Marjorie Taylor Greene and videos from Rep. Paul Gosar and then–Idaho Lt. Gov. Janice McGeachin.",
    "CBS News; Guardian",
  ],
  [
    "Nov 22, 2022",
    "Dinner at Mar-a-Lago with Donald Trump and Ye (Kanye West). Trump said he did not know Fuentes.",
    "ABC News; NBC News; New York Times",
  ],
  [
    "Jan 25–26, 2023",
    "X briefly reinstates the account, then suspends it again after posts praising Hitler and the Unabomber, according to researchers cited in coverage.",
    "HuffPost; BSA later summary",
  ],
  [
    "May 2–3, 2024",
    "Musk says the account will be restored if Fuentes does not violate the law; X reinstates it. WIRED later reported the account had 168,000 followers at restoration.",
    "Axios; Forbes; WIRED",
  ],
  [
    "Aug 2024",
    "Fuentes announces Groyper War 2 against the Trump–Vance campaign and urges followers to withhold votes. Vance calls him a total loser.",
    "Washington Post, Aug 18, 2024",
  ],
  [
    "Nov 5, 2024",
    "Posts Your body, my choice. Forever on X after the presidential election. The phrase spread widely; ISD documented a sharp rise in related harassment.",
    "ISD; Independent",
  ],
  [
    "Nov 10–27, 2024",
    "A woman, Marla Rose, alleges he pepper-sprayed and pushed her at his Berwyn, Illinois, home. He is arrested and charged with battery on November 27.",
    "Chicago Sun-Times; Chicago Tribune",
  ],
  [
    "Dec 18, 2024",
    "An armed man, later identified as John Lyons, comes to the home. Police shoot and kill Lyons. Fuentes called it an assassination attempt; coverage has stated that police did not establish a connection between Lyons and a plot against him.",
    "Chicago Sun-Times; CBS Chicago; Wikipedia summary of local reporting",
  ],
  [
    "Sep 10, 2025",
    "Charlie Kirk is killed at Utah Valley University. Online speculation tied the alleged shooter to groypers; Forbes later corrected an earlier suggestion of a link and reported no explicit connection. Fuentes denied the claim and told followers he disavowed anyone who took up arms. WIRED, on September 23, reported his X following had grown by almost 175,000 since Kirk's death, and Rumble by more than 100,000.",
    "Forbes, Sep 13 and 15, 2025; WIRED, Sep 23, 2025",
  ],
  [
    "Sep 2025",
    "A newly created YouTube channel is removed hours after appearing. YouTube said a limited reinstatement pilot did not yet apply and that previously terminated users may not create new channels. Fuentes said he had been banned since February 2020.",
    "The Independent",
  ],
  [
    "Oct 27, 2025",
    "Tucker Carlson interviews Fuentes in a session of more than two hours. PBS reported the interview had been seen more than 20 million times by November 7, 2025. Heritage Foundation president Kevin Roberts initially defended Carlson, prompting a conservative rift and Heritage staff changes.",
    "PBS NewsHour; CNN; CBS News; Politico",
  ],
  [
    "Nov 16, 2025",
    "Trump, asked about the Carlson interview, says people have to decide and that he does not know much about Fuentes.",
    "AP News",
  ],
  [
    "Dec 8, 2025",
    "Piers Morgan interviews Fuentes. Coverage focused on Fuentes calling Hitler cool and declining to retract the remark.",
    "The Independent; Racket News",
  ],
  [
    "Dec 2025",
    "Reporting describes a plea agreement in the battery case, including community service, an anger-management course, restitution, and an apology, with the charge to be dismissed if conditions were met.",
    "Yahoo News / local reporting; Wikipedia compilation",
  ],
  [
    "Apr 13, 2026",
    "The New York Times reports that Fuentes has discontinued AFPAC permanently because of safety concerns.",
    "New York Times",
  ],
  [
    "Apr 20, 2026",
    "The Washington Post reports that roughly 11,000 donors sent nearly $900,000 in Rumble superchats from January 2025 through March 2026.",
    "Washington Post",
  ],
  [
    "Jul 24, 2026",
    "Fuentes appears with Hunter Biden in an interview moderated by Andrew Callaghan on Channel 5.",
    "The Hollywood Reporter, Jul 27, 2026",
  ],
]

export const metricsAccountTableRows: [string, string, string, string, string][] = [
  [
    "X",
    "@NickJFuentes",
    "1,317,502 followers",
    "Nov 14, 2026, 6:23 p.m. CT",
    "X public API",
  ],
  [
    "X",
    "@NickJFuentes",
    "8,075 posts; 519 following; 3,848 lists",
    "same pull",
    "X public API",
  ],
  [
    "X",
    "@AmFirstHQ",
    "33,981 followers; 161 posts; verified (blue)",
    "Nov 14, 2026, 6:25 p.m. CT",
    "X public API",
  ],
  [
    "Rumble",
    "Nicholas J. Fuentes / nickjfuentes",
    "725,690 followers",
    "Nov 11, 2026, 12:53 p.m. CT",
    "NextCounts (public count close)",
  ],
  [
    "Telegram",
    "t.me/nickjfuentes",
    "112.3K subscribers, as displayed",
    "Nov 14, 2026",
    "TG.ME",
  ],
  [
    "Cozy.tv",
    "cozy.tv/Nick, listed on Telegram bio",
    "Unavailable",
    "Nov 14, 2026",
    "No public follower total found",
  ],
]

export const metricsHistoryTableRows: [string, string, string, string][] = [
  ["May 2024, at X reinstatement", "168,000", "—", "WIRED, Sep 23, 2025"],
  ["Early 2025", "fewer than 500,000", "—", "Le Grand Continent, Nov 4, 2025"],
  [
    "March 2025, combined across profiles",
    "about 724,000 combined, not X-only",
    "included in combined total",
    "ADL, updated profile",
  ],
  ["Early June 2025", "—", "150,000", "Media Matters, Dec 19, 2025"],
  ["End of summer 2025, before Sep 10", "—", "about 250,000", "Le Grand Continent"],
  [
    "Sep 10–23, 2025",
    "+ almost 175,000 after Kirk's death, to almost 925,000",
    "+ more than 100,000 after Kirk's death",
    "WIRED, Sep 23, 2025",
  ],
  [
    "Nov 4, 2025",
    "more than 1 million",
    "more than 470,000 (also almost 500,000)",
    "Le Grand Continent",
  ],
  ["Nov 7, 2025", "over 1 million", "—", "Blue Square Alliance Command Center"],
  ["Dec 13, 2025", "—", "580,000", "Racket News"],
  ["Dec 19, 2025", "—", "nearly 600,000", "Media Matters"],
  [
    "Apr 20, 2026",
    "—",
    "680,000; Rumble videos viewed more than 100 million times",
    "Washington Post",
  ],
  ["Oct 20, 2026 (UTC close)", "—", "711,461", "NextCounts"],
  ["Nov 11, 2026, 12:53 p.m. CT", "—", "725,690; 7-day average +1,427 per day", "NextCounts"],
  ["Nov 14, 2026, 6:23 p.m. CT", "1,317,502", "—", "X public API"],
]

export const metricsParagraphs = [
  `Fuentes's largest public audiences are now on X and Rumble. Telegram is smaller and, on available 2026 measurements, slightly down. A current public follower count for Cozy.tv was not found.`,
  `The @NickJFuentes X account was created April 14, 2014, and is not currently shown as verified. Bio text at the time of the pull was America First and Christ is King, with location Chicago, IL. @AmFirstHQ, created July 1, 2023, describes itself as the official X account for America First with Nicholas J. Fuentes. Handles @AmericaFirstHQ and @CozyTV returned as suspended.`,
  `Switch the chart to compare published follower history on X and Rumble. Social Blade no longer publishes X history after dropping the platform in March 2025, so earlier points come from news outlets and NextCounts daily closes.`,
  `On those published points, X grew from 168,000 at the May 2024 reinstatement to almost 925,000 by September 23, 2025, then to 1,317,502 on November 14, 2026. That is roughly an eightfold increase in about 30 months, with a particularly steep rise in the two weeks after Kirk's death. Rumble rose from 150,000 in early June 2025 to 725,690 by November 11, 2026, including a jump from about 250,000 at the end of summer 2025 to more than 470,000 by early November 2025. Growth on Rumble continued in 2026 but at a slower pace than in late 2025.`,
  `Telegram channel t.me/nickjfuentes was created June 19, 2019. tgAtlas recorded 115,349 subscribers in week 36 of 2026 and 114,673 on September 14, 2026 (down 0.59% over 14 days). TG.ME last stored 113,700 on October 9, 2026, and displayed 112.3K when checked on November 14, 2026. Unlike X and Rumble, the available 2026 Telegram readings show a mild decline.`,
  `Other platform status, from published reporting rather than live checks: Fuentes remains banned from YouTube (February 2020, with a failed September 2025 return attempt), Meta-owned Facebook and Instagram personal accounts, Twitch, Reddit, and, in earlier waves, DLive, Gettr, TikTok, and several payment processors including PayPal, Venmo, Patreon, Shopify, Stripe, Streamlabs, and Coinbase. The ADL, in a March 2026 update, said activity on Cozy.tv had dwindled even though the site still exists.`,
  `Revenue is not a follower count, but it is a documented audience-support metric. The Washington Post, in an April 20, 2026 analysis of 1,435 hours of Rumble streams from January 2025 through March 2026, found roughly 11,000 donors sent nearly $900,000 in superchats (more than 26,000 superchats totaling more than $896,000 across 228 videos after January 2025). Ten accounts gave about $77,000; the top 500 accounts provided more than $400,000, almost half the total. The Post noted a 15% fee on the Entropy payment tool, implying about $760,000 pretax from those superchats. Monthly superchat totals rose from $60,000 in the month before the Carlson interview to more than $100,000 in the month after, and average monthly donations were 10% higher after the appearance. WIRED separately reported that a September 2025 Kirk commemorative livestream exceeded 2.5 million views, and that the top 50 Super Chat donations in less than an hour on a later stream exceeded $5,500. Earlier, researcher Megan Squire found more than $114,000 in DLive donations in the 10 months before January 2021. A December 2020 bitcoin transfer from a French donor was then worth more than $250,000, according to contemporaneous reporting citing Chainalysis.`,
] as const

export const networkParagraphs = [
  `The groyper scene is consistently described as loose. Many amplifying accounts are anonymous clip pages rather than named public figures, and some people identified in older monitoring reports later split with Fuentes or changed handles. This briefing therefore does not publish a roster of personal accounts. It records only the official show account checked live and network totals already published by monitoring groups.`,
  `The ADL reported that Fuentes remains personally banned from official Instagram accounts, but that clips from America First still circulate through collaborator posts. WIRED and the Post have described the same pattern on X, Instagram, and TikTok, where short clips can reach millions of views. Media Matters earlier identified a smaller set of Instagram accounts promoting Fuentes or Cozy.tv; that older count is not used here as a current total. Historical monitoring pieces from the ADL have also named individual livestreamers and activists in connection with AFPAC or Cozy.tv in 2022; those identifications are not treated as a current follower ranking.`,
  `A separate claim, repeated in several November 2025 stories, is Rod Dreher's report that a Washington source told him something like 30 to 40 percent of Republican staffers under 30 were groypers. The figure has not been independently verified, and other observers have disputed it. It is a widely circulated allegation, not a measured membership count.`,
] as const

export const networkTableRows: [string, string, string, string][] = [
  [
    "Official X account @AmFirstHQ",
    "33,981 followers",
    "Nov 14, 2026, 6:25 p.m. CT",
    "X public API",
  ],
  [
    "Instagram accounts ADL identified as affiliated with the Groyper movement",
    "at least 105 accounts, more than 1.4 million followers combined",
    "January 2026",
    "ADL Center on Extremism, cited again by JTA, Apr 15, 2026",
  ],
  [
    "Collaborative Instagram reel of Fuentes, six accounts",
    "more than 2.7 million views and 172,000 likes",
    "as of Feb 20, 2026, on a Nov 2025 post",
    "ADL Instagram report",
  ],
  [
    "Another collaborative reel cited in the same report",
    "at least 1 million views and more than 140,000 likes",
    "as of Feb 20, 2026, on a Sep 2025 post",
    "ADL Instagram report",
  ],
]

export const engagementSummaryRows: [string, string, string, string, string, string][] = [
  [
    "Impressions (views)",
    "1,525,391",
    "2,031,256",
    "984,049–2,167,634",
    "682,461",
    "12,126,459",
  ],
  ["Likes", "41,661", "44,572", "29,040–59,137", "20,900", "90,529"],
  ["Reposts", "2,643", "2,929", "2,008–3,630", "1,083", "6,502"],
  ["Replies", "836", "1,442", "594–1,661", "392", "7,607"],
  ["Quotes", "152", "333", "96–323", "31", "3,381"],
  ["Bookmarks", "1,476", "1,953", "1,050–2,830", "272", "5,760"],
]

export type EngagementPostRow = {
  date: string
  post: string
  postUrl: string
  views: string
  likes: string
  reposts: string
}

export const engagementPostRows: EngagementPostRow[] = [
  {
    date: "Nov 3, 2026",
    post: "Get out and vote Democrat today. Highest-reach post in the sample.",
    postUrl: "https://x.com/NickJFuentes/status/2117679818099867978",
    views: "12,126,459",
    likes: "90,529",
    reposts: "6,502",
  },
  {
    date: "Nov 4, 2026",
    post: "I love winning.",
    postUrl: "https://x.com/NickJFuentes/status/2117830947580129776",
    views: "2,229,338",
    likes: "67,610",
    reposts: "4,741",
  },
  {
    date: "Sep 15, 2026",
    post: "Media-only post at the sample median for impressions.",
    postUrl: "https://x.com/NickJFuentes/status/2099914646253695020",
    views: "1,525,391",
    likes: "43,245",
    reposts: "2,510",
  },
  {
    date: "Oct 31, 2026",
    post: "HAPPY HALLOWEEN. Lowest impressions in the sample.",
    postUrl: "https://x.com/NickJFuentes/status/2116606867828814121",
    views: "682,461",
    likes: "24,280",
    reposts: "1,426",
  },
]

export const engagementParagraphs = [
  `In this window the account posted 25 original posts over 54 days, or about three per week, not counting replies. Engagement was consistently high. The sample includes the November 3 midterms period and may sit above a quieter baseline.`,
  `A typical original post in the sample was seen about 1.5 million times and received about 42,000 likes and 2,600 reposts. Even the lowest-reach post still had more than 680,000 impressions and 20,900 likes. Removing the largest outlier, the November 3 midterms post, leaves a median of 1,469,084 impressions, 40,867 likes, and 2,614 reposts, so the midterms spike raises the average more than the midpoint.`,
] as const

export const coverageTableRows: [string, string, string, string][] = [
  [
    "Online mentions of Fuentes after Jan. 6, 2021",
    "more than 2.5 million",
    "Jan 2021–Nov 7, 2025",
    "BSA Command Center",
  ],
  [
    "Mentions after the Carlson interview",
    "more than 378,000",
    "Oct 27–Nov 7, 2025",
    "BSA Command Center",
  ],
  [
    "Mentions of the word Groyper",
    "more than 1.41 million since 2017; 48% after Sep 10, 2025",
    "2017–Nov 7, 2025",
    "BSA Command Center",
  ],
  [
    "Largest mention spikes in that dataset",
    "Jan 2021; Nov 2022 Mar-a-Lago dinner; Sep 2025 Kirk killing",
    "same",
    "BSA Command Center",
  ],
  [
    "Guest appearances on at least 20 right-leaning online shows",
    "at least 28.4 million views on YouTube, Rumble, and Kick",
    "July 2025 through mid-December 2025",
    "Media Matters, Dec 19, 2025",
  ],
  [
    "Carlson interview views",
    "more than 20 million",
    "as of Nov 7, 2025",
    "PBS NewsHour",
  ],
  [
    "Google searches for Nick Fuentes",
    "exponential increase in mid-September 2025",
    "after Sep 10, 2025",
    "Le Grand Continent, citing Google data",
  ],
]

export const coverageParagraphs = [
  `Coverage has come in spikes around a few public controversies, with a clear step-up in mainstream attention from late 2022 and an even larger wave in September–November 2025. No independent media-database count (such as LexisNexis or Media Cloud) was obtained for this briefing. The volume figures below come from Blue Square Alliance's Command Center, an advocacy monitoring dataset, and should be read as that organization's tallies, not as a census of news articles.`,
  `The New York Times, The Washington Post, AP, Reuters, PBS, CNN, ABC, NBC, The Guardian, The Atlantic, and WIRED have all published stories on Fuentes, with the largest recent waves around the November 2022 Mar-a-Lago dinner and the September–November 2025 period after Kirk's death and the Carlson interview. On the right, Ben Shapiro and Mark Levin publicly criticized the Carlson interview, while Carlson, Patrick Bet-David, and Piers Morgan gave Fuentes long-form interviews. Heritage Foundation president Kevin Roberts initially defended Carlson; Heritage later issued a further statement and announced staff reassignments. In February 2026, The Washington Post reported that the California Republican Party had circulated a memo urging officials to block candidates who promote Fuentes and Groyper culture.`,
  `Notable stories in the past 12 months, each linked in the sources section, include WIRED's September 23, 2025 profile of Fuentes's growth and organizing talk after Kirk's death; the October 27 Carlson interview and the Heritage rift (CNN, CBS, PBS, AP, Politico); Michelle Goldberg's November 3, 2025 New York Times column on Fuentes's rising influence; the November 10, 2025 Times explainer Who Are the Groypers?; Trump's November 16 comments (AP); the December 8 Piers Morgan interview; Media Matters naming Fuentes its 2025 Misinformer of the Year; The Atlantic's February 2026 essay on conservative conflict after Kirk; the April 20, 2026 Washington Post donor investigation; the ADL's 2026 Instagram-network findings; and the July 24, 2026 Channel 5 interview with Hunter Biden.`,
] as const

export const gapsBullets = [
  "No current public follower or subscriber total was found for Cozy.tv, Truth Social, Gab, Kick, or TikTok clip circulation, even though some of those surfaces appear in reporting.",
  "Social Blade no longer tracks X, so pre-2024 and intra-year X history is limited to a handful of published anchors rather than a continuous series.",
  "Telegram's live official count was not read inside the Telegram app; figures come from TG.ME and tgAtlas and are slightly lagged or rounded.",
  "A full roster of prominent personal groyper accounts was not compiled, because current handles and ongoing affiliation could not be confirmed at the same standard as official accounts.",
  "There is no LexisNexis or Media Cloud article-count trend in this briefing. Mention totals are from one advocacy-group dashboard and from selected view counts.",
  "The X engagement sample is 25 original posts over seven weeks and is not a year-long average. Livestream concurrent-viewer series on Rumble were not independently verified beyond scattered published figures.",
  "Donor and view figures from The Washington Post and Media Matters are their analyses, not platform-official dashboards.",
] as const

export const sourceLinks = [
  {
    title: "Nick Fuentes (overview and citations)",
    site: "Wikipedia",
    href: "https://en.wikipedia.org/wiki/Nick_Fuentes",
  },
  {
    title: "Nicholas J. Fuentes: Five Things to Know",
    site: "ADL",
    date: "Updated Mar 26, 2026",
    href: "https://www.adl.org/resources/article/nicholas-j-fuentes-five-things-know",
  },
  {
    title: "Who is Nick Fuentes and Why Is His Antisemitism Dangerous for America?",
    site: "AJC",
    href: "https://www.ajc.org/news/who-is-nick-fuentes-and-why-is-his-antisemitism-dangerous-for-america",
  },
  {
    title: "Who Are the Groypers?",
    site: "New York Times (archived)",
    date: "Nov 10, 2025",
    href: "https://archive.is/VAasn",
  },
  {
    title: "Why alt-right trolls shouted down Donald Trump Jr.",
    site: "Vox",
    date: "Nov 11, 2019",
    href: "https://www.vox.com/policy-and-politics/2019/11/11/20948317/alt-right-donald-trump-jr-conservative-tpusa-yaf-racism-antisemitism",
  },
  {
    title: "Nick Fuentes Plan to Conquer America",
    site: "WIRED",
    date: "Sep 23, 2025",
    href: "https://www.wired.com/story/nick-fuentes-plan-to-conquer-america/",
  },
  {
    title: "Rumble follower history for Nicholas J. Fuentes",
    site: "NextCounts",
    date: "Updated Nov 11, 2026",
    href: "https://nextcounts.com/analytics/rumble/profile/_c661227",
  },
  {
    title: "Telegram channel @nickjfuentes",
    site: "TG.ME",
    date: "Checked Nov 14, 2026",
    href: "https://tg.me/nickjfuentes",
  },
  {
    title: "Telegram subscriber measurements",
    site: "tgAtlas",
    date: "Sep 14, 2026",
    href: "https://tgatlas.org/channel/nickjfuentes",
  },
  {
    title: "Official Telegram channel",
    site: "Telegram",
    href: "https://t.me/nickjfuentes",
  },
  {
    title: "X growth after Kirk death and year-to-date Rumble rise",
    site: "Le Grand Continent",
    date: "Nov 4, 2025",
    href: "https://legrandcontinent.eu/es/2025/11/04/la-audiencia-de-nick-fuentes-casi-se-ha-duplicado-desde-el-asesinato-de-charlie-kirk/",
  },
  {
    title: "Timeline: The Many Faces of Nick Fuentes",
    site: "Racket News",
    date: "Dec 13, 2025",
    href: "https://www.racket.news/p/timeline-the-many-faces-of-nick-fuentes",
  },
  {
    title: "Superchat donor analysis",
    site: "Washington Post",
    date: "Apr 20, 2026",
    href: "https://www.washingtonpost.com/technology/2026/04/20/nick-fuentes-stream-donors-funding/",
  },
  {
    title: "Instagram Groyper network",
    site: "ADL",
    href: "https://www.adl.org/resources/report/how-metas-content-moderation-practices-risk-turning-instagram-hub-hate",
  },
  {
    title: "ADL Instagram findings summary",
    site: "JTA",
    date: "Apr 15, 2026",
    href: "https://www.jta.org/2026/04/15/culture/moderation-cuts-leave-most-extremist-antisemitic-content-on-instagram-unchecked-adl-finds",
  },
  {
    title: "Musk to reinstate Fuentes on X",
    site: "Axios",
    date: "May 3, 2024",
    href: "https://www.axios.com/2024/05/03/elon-musk-nick-fuentes-x-account",
  },
  {
    title: "Trump hosts Ye and Fuentes at Mar-a-Lago",
    site: "ABC News",
    date: "Nov 25, 2022",
    href: "https://abcnews.com/Politics/trump-hosts-kanye-west-nick-fuentes-mar-lago/story?id=93965361",
  },
  {
    title: "Inside story of the Mar-a-Lago dinner",
    site: "NBC News",
    date: "Nov 29, 2022",
    href: "https://www.nbcnews.com/politics/donald-trump/story-trumps-explosive-dinner-ye-nick-fuentes-rcna59010",
  },
  {
    title: "What Is A Groyper? Fuentes says followers framed in Kirk shooting",
    site: "Forbes",
    date: "Sep 13, 2025; corrected Sep 15",
    href: "https://www.forbes.com/sites/tylerroush/2025/09/13/what-is-a-groyper-nick-fuentes-says-his-followers-framed-in-charlie-kirk-shooting/",
  },
  {
    title: "Carlson interview and Republican rift",
    site: "PBS NewsHour",
    date: "Nov 7, 2025",
    href: "https://www.pbs.org/newshour/show/tucker-carlsons-interview-with-antisemite-nick-fuentes-exposes-rift-among-republicans",
  },
  {
    title: "How Fuentes ignited a civil war at Heritage",
    site: "CNN",
    date: "Nov 6, 2025",
    href: "https://www.cnn.com/2025/11/06/politics/nick-fuentes-tucker-carlson-heritage-foundation-kevin-roberts",
  },
  {
    title: "Heritage backlash after Roberts defends Carlson",
    site: "CBS News",
    date: "Nov 7, 2025",
    href: "https://www.cbsnews.com/news/heritage-foundation-kevin-roberts-tucker-carlson-interview-nick-fuentes/",
  },
  {
    title: "Trump defends Carlson over Fuentes interview",
    site: "AP News",
    date: "Nov 16, 2025",
    href: "https://apnews.com/article/donald-trump-tucker-carlson-nick-fuentes-c48a9b61d2412f43d254b2fd472d410f",
  },
  {
    title: "Tracking Fuentes mentions and visibility",
    site: "Blue Square Alliance",
    date: "Nov 7, 2025",
    href: "https://www.bluesquarealliance.org/command-center-insights/tracking-nick-fuentess-rise-how-an-extremist-is-gaining-visibility-through-the-mainstream/",
  },
  {
    title: "Fuentes as 2025 Misinformer of the Year, including Rumble and guest-appearance totals",
    site: "Media Matters",
    date: "Dec 19, 2025",
    href: "https://www.mediamatters.org/misinformer-year/nick-fuentes-biggest-beneficiary-crowded-and-fractured-new-era-right-wing-media",
  },
  {
    title: "YouTube removes new Fuentes and Jones channels",
    site: "The Independent",
    date: "Sep 2025",
    href: "https://www.independent.co.uk/news/world/americas/us-politics/alex-jones-nick-fuentes-youtube-ban-covid-b2833859.html",
  },
  {
    title: "The Second Death of Charlie Kirk",
    site: "The Atlantic",
    date: "Feb 2026",
    href: "https://www.theatlantic.com/politics/2026/02/charlie-kirk-carlson-fuentes-antisemitism/685869/",
  },
] as const

export const methodParagraph = `Current X figures were read from X's public user and post endpoints on November 14, 2026, at about 6:23 p.m. America/Chicago. Other platforms were checked the same day via public web trackers and published reporting. Times that arrived in UTC were converted to America/Chicago.`

export const methodCallout =
  "Every figure below has a source and a pull or publication date. Approximate wording from a source (almost, nearly, more than) is preserved and is not treated as an exact count. Only official America First accounts and network totals already named by reputable sources are listed; unnamed clip accounts and unverified personal handles are omitted."

export const sourcesIntro = `Primary metric reads and the main published sources used in this briefing are listed below. Additional contemporaneous articles cited in the timeline (Chicago Tribune, Time, Vox, Daily Dot, ProPublica, Daily Beast, CBS, and local Chicago outlets) are named in that table.`