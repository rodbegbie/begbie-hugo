---
title: "Increase your hiring success with job success profiles"
date: 2021-04-19
featureImage: images/writing/handshake-320.jpg
postImage: images/writing/handshake-970.jpg
subtitle: Hiring the right person is a hard task. Don’t make your life harder by not knowing who the right person is.
---

*Hiring the right person is a hard task. Don’t make your life harder by not knowing who the right person is.*

---

When I started hiring engineers for my startup, I thought it would be easy. I’d seen enough job postings in my life to know you just had to come up with some qualifications (‘BS or equivalent in Computer Science’, ‘5+ years experience with Python’, maybe even a cheeky ‘Ability to work both independently and as part of a team’), throw them into a bulleted list, and start picking the best candidates from the resumes that will surely flood in. But after some early hires that came through social connections, I struggled. We had raised funding to spend on an engineering team, but no new engineers to spend it on!

It turns out that hiring is a much more complex and time-consuming task, and your effectiveness at it is key to being a successful engineering leader.

There are many great guides out there on how to source candidates, optimize funnels, run interviews, and get offers accepted. In this article, I want to focus on a particular tool I learned that aided with all those tasks and greatly increased our ability to hire great people.

### What makes a successful hire?

Taking a step back, think about someone great at your company. What are the aspects of this person that make them successful? There are probably characteristics both technical and behavioral. For example, they can solve complex architectural challenges; their estimates are always spot-on; they mentor more junior employees; they can make the case for technical investment, even when others are skeptical; they speak at conferences and inspire attendees to apply for jobs; they have good product sense and suggest ideas for features that no-one else thought of; they spend time in Slack helping answer questions from other teams.

Now go back and look at the requirements on the job posting they originally saw when they applied to the company. Is there much overlap? How many of these factors did you know about from interviews when the decision was made to hire them?

All too often, **what we say the requirements are (and what we test for in interviews) is only loosely correlated with the actual impact a successful employee can have.** At best, this means we risk hiring technically-qualified but lower-impact teammates. At worst, it acts as a filter, blocking potential star-hires from even getting a callback from a recruiter. (In my career, I’ve worked with many engineers who don’t have a Computer Science degree but are terrific communicators and fast learners, and who have leveled-up their teams immensely.)

Instead of focusing on perceived requirements, how would the hiring process change if we drive this from a perspective of what a successful hire will *do?*

### The Job Success Profile

The turning point in improving our hiring was when a friend recommended the book [*Hire With Your Head* by Lou Adler](https://www.amazon.com/Hire-Your-Head-Performance-Based-Hiring/dp/0470128356). It’s a terrific book that espouses an approach of ‘performance-based hiring’: moving from making decisions based on qualifications and resume experience to evaluating if candidates have evidence of previous success in the areas you need them to deliver in. Among its many recommendations, the one that had the most immediate benefit was creating a profile of the results of an employee who displays superior performance in the role you’re trying to fill. We referred to this as the Job Success Profile.

Our template was relatively simple. As a hiring manager, for each role you were trying to fill, you needed to document:

1. **Primary objectives.** The two or three main responsibilities for the role. Overall success of the employee would be measured against their impact on these objectives.
2. **Secondary objectives.** Other responsibilities that were important, but lower priority. 
3. **Success metrics.** A short list of measurable goals that a high-performing employee would deliver by the end of one month, three months, six months, and twelve months.

As an example, here is a simplified profile I wrote for a senior server-side engineer I was looking to hire.

> ### Primary objectives
> 
> * __Build the backend systems__ that power our growth as we add features, scale to new cities, and expand our user base.
> * __Mentor__ less-experienced web and server engineers in the organization.
> 
> ### Secondary objectives
> * __Work closely with our product team__ to define, design, architect, and build server-side functionality.
> * __Define clear hand-offs and documentation__ between server-side and front-end (web or iOS) engineers.
> * __Increase quality and testability__ of all our code.
> 
> ### Success metrics
> #### First 30 days
> * Build and ship at least one major server-side feature.
> * Investigate current server-side codebase and make recommendations for tactical code quality and architecture improvements.
> 
> #### First 90 days
> * Complete development of several server-side features from initial spec discussions through to shipping.
> * Display informal mentorship of junior web or server engineers.
> * Become involved in engineering recruiting. Offer feedback on our process, and interview new candidates.
> 
> #### First 6 months
> * Act as architect for other engineers' projects, working with them prior to their implementation to hammer out design decisions.
> * Several notable examples of our product and engineering processes being improved due to your input.
> * Be considered the go-to code reviewer for most server-side changes.
> 
> #### First 12 months
> * Be our server-side architect. Be the primary face of server-side engineering to all Sosh teams, from engineering to company leadership.

### Using your Job Success Profile
This document was used throughout the recruiting process. It should be noted that it is intended purely as an internal document, _not_ something that is shared with candidates. Here is how it was used as input into various stages of the funnel.

#### Identifying what roles we needed to hire for

I remember discussing with a couple of teammates our need to hire a ‘data engineer’. There was general agreement, so I started crafting the success profile. Only once I shared it, I discovered there had been misalignment on what we all thought a ‘data engineer’ would do. My vision was that they’d help us build up and improve our scraping and structuring of messy web data into our schema. Our Head of Product assumed we were going to look for a machine learning expert who would help us build impressive new recommendation features for our users. And the CEO was excited that we were going to hire someone to process our analytics data and build business dashboards that would provide a better overview of the company.

Through reviewing the success profile, we uncovered this misalignment before we’d even posted the job. Compared to the time potentially wasted by only catching this once we’d started interviewing candidates and were trying to make a hiring decision, this factor alone fully justified the time spent writing profiles.

In addition, sometimes I would sit down to write a profile for a role that was a high priority in my head, and find I struggled to write a cohesive set of success metrics beyond three or six months. This was a signal that I needed to think more seriously about if this was a full-time hire we needed to make at all, or perhaps a set of tasks more suited to a contractor relationship.

#### Writing the job ad

Having a clear sense of what was important for each role made it simpler to write job postings that were more broadly targeted. If a 30-day success metric is ‘Build and ship at least one major server-side feature’, that doesn’t mean a candidate needs to have a Computer Science degree, or 5 years of Python experience. Rather, we can look for evidence of candidates being quick learners, and that they have historical success building and shipping server-side features.

Our postings evolved to have statements like, ‘We care more about experience and passion than formal schooling. Computer Science degrees are nice, but experience working on incredible web or mobile apps is much more important.’ And, ‘You have a history of mentoring engineers. Whether formally or informally, you can point to engineers whose careers have been improved by your guidance.’ This change in tone emphasized what we felt was important to our engineering culture, and encouraged applications from candidates with less-traditional backgrounds.

And on occasion, we would write multiple postings for the same role and success profile. When looking for an experienced iOS engineer, I wrote one job posting emphasizing broad knowledge of general iOS architecture: ‘You have depth of experience in the iOS frameworks. From AutoLayout to CFNetwork; from CoreData to CoreText. You are familiar with both their benefits, and their pathological quirks.’ And a second one focused on UI expertise: ‘“Attention to detail” is your middle name. You sweat the pixels. You stress over whether an animation should ease in, ease out, or both.’  At the end of the day, the job success profile was the same, but we could target candidates with different backgrounds and motivations.

#### Screening candidates

With a success profile in hand, application reviews and candidate outreach shifted perspective. Instead of being a filtering process (taking resumes and LinkedIn profiles, and rejecting the ones that don’t match your criteria), we started digging for the positive signals that might previously have been overlooked.

Recruiters had more detail about what we were looking for, and were empowered to discuss those needs with candidates, able to paint a clear picture of what the work would look like. They could put forward a more diverse mix of candidates that had evidence of the traits we were after. Enthusiasm for learning, a relentless drive to solve problems, or strong communication skills could be the key thing that got a candidate brought in for interviews when we had defined them as important success criteria for the role.

#### Interviewing and making the hiring decision

Having the success profile in the pre-interview packet for every interviewer had the immediate effect of ensuring we gave consistent information to the candidate. People want to work for companies that are organized, and nothing fires up a candidate’s ‘this company doesn’t have their act together’ sense quite like being told different things by different employees! Hearing a consistent story from every person they talk to might be the thing that makes a candidate accept your offer.

The specificity of the profile meant we could paint a clear picture of what their day-to-day job would be if they joined us, which became important if we decided to make an offer. We found that the more crisply a candidate could picture the work they would be doing, the more successful we became at closing them.

We also used the profiles to adapt the interview loops and choose interviewers based on the needs of each individual role. Positions that benefitted from product sense might talk with a product manager and a designer. Senior roles which required the ability to mentor and grow others might be paired up with a junior engineer to see if they were good at explaining concepts.

And in the debriefs following an interview loop, the question was always, ‘Do we have evidence this person will be successful in the role we’ve defined?’ The profile meant we were better placed to have the discussion about a candidate’s success in the specific role we needed them for, and avoided falling into a trap of ruling them out for superficial concerns. Decisions like these are always a little messy due to our biased, instinctive human brains, but the profile gave us a stronger framework to make the decision around extending an offer. 

#### Onboarding
Once we had interviewed, made the offer, and closed a candidate, the Job Success Profile made one more appearance. On the new hire’s first day, I would show them the profile they had been evaluated against.

First, I’d ask if there were any surprises on the page (there rarely were), but then we would use that as the basis for setting up their goals for their first month. The specificity of the profile meant that new employees didn’t have to spend time figuring out what they were meant to be doing (and worrying about if they were meeting expectations), and could get off to a running start.

---

Getting the concept of the Job Success Profile into place, and using it during hiring, was a turning point for us as a team. There are many things that go into being able to build, manage, and tune your hiring pipeline, but no tool I’ve seen has been so impactful across the whole process. I highly recommend writing one the next time you have a position to fill.

---
_This article was originally posted on [LeadDev.com](https://leaddev.com/hiring-onboarding-retention/increase-your-hiring-success-job-success-profiles) and edited by Ellie Spencer-Failes._