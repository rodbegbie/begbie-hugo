---
title: "Estimating your way to success in software engineering"
date: 2021-02-15
featureImage: images/writing/writing-320.jpg
postImage: images/writing/writing-970.jpg
subtitle: ‘Weeks of coding can save you hours of planning.’ – Old software engineering proverb.
---

_‘Weeks of coding can save you hours of planning.’ – Old software engineering proverb._

---

There’s a stereotype of how communication goes when engineers are planning projects:

> __Manager:__ Go build this thing.
>
> __Engineer:__ That’ll take two months to build.
>
> __Manager:__ Can you do it in one?
>
> __Engineer:__ I’ll try.
> 
> _(Three months pass. Nothing ships.)_
> 
> __Manager:__ Wow, engineers suck at estimating.
>
> __Engineer:__ Wow, estimating is a waste of time.

It turns out that engineers are pretty lousy at predicting the future. (If we weren’t, we’d all be off buying lottery tickets instead of writing scripts to parse log files.) That said, estimating projects has value for engineering teams far beyond setting timeline expectations with non-engineers, and improving your ability to estimate can greatly increase the chance of success for your projects.

### The walk to Los Angeles

One of my favorite pieces of writing on the topic of software engineering is [an answer on Quora](https://www.quora.com/Why-are-software-development-task-estimations-regularly-off-by-a-factor-of-2-3/answer/Michael-Wolfe?share=1) to the question, ‘Why are software development task estimations regularly off by a factor of 2-3?’ telling the tale of some folks trying to hike from San Francisco to Los Angeles. It’s a very funny metaphor for the frustration felt by an engineering team (and those who work with them). I encourage you to read it.

Upon reading it, you may shrug your shoulders and say ‘Well, why bother estimating? We’re going to be wrong anyway.’

I would like to push back on that reaction. __I think there are four main reasons why estimation is an incredibly important tool at which engineers should be continuously attempting to improve.__

### 1. Estimation forces us to think about what we’re going to do _before_ we start writing code

To misquote Jamie Zawinski: ‘Some people, when confronted with a problem, think “I know, I’ll write some code!” Now they have two problems.’

In order to start an estimate, you need to start thinking through the task at hand. Your first steps should be _reading_ code and existing design docs before applying your own knowledge to answer questions like:

* What are the components of this project?
* What pieces of the solution already exist? How do they work?
* What needs to get built from scratch? Do you know how to start these things?
* Who else will be affected? Which other engineers or teams am I dependent on?
* What are the risks? How will we test this? What monitoring needs to be in place? Will this require any docs for on-call engineers?

Only once you have these answers can you give a confident, educated estimate.

__If these answers aren’t readily available, that’s probably a signal you need to spend more time in a technical design phase before you can commit to delivering confidently-estimated project work!__

### 2. Estimation enables meaningful discussion between engineers pre-development

Once we have estimates written down, we can discuss them as peers. Sometimes the numbers can be surprising (e.g. imagine seeing that the subtask of ‘Commit code to git’ was estimated at two days). This presents opportunities for tech leads or other engineers to ask questions (‘Why do you think committing code takes so long?’) before the engineer goes off and starts coding. These gaps can often be unspoken assumptions that were overlooked in a design doc but which are surfaced at this stage.

### 3. Estimation is valuable input for informed product scoping

Product and design specs are often done without a true understanding of the real cost of implementation. Sometimes a small ‘nice to have’ feature can double the implementation cost of a plan.

Detailed engineering estimation allows engineers and product managers to analyze the potential cost of development, and ensure that what we’re planning on building is the smartest use of our limited time and resources.

__My golden rule of software engineering:__ our job as engineers is _not_ to turn product specs into code. Our job is to deliver the maximum value for the company at the lowest cost.

### 4. Estimation gathers data we can measure against at the end of the project

As engineers, we should treat our processes like our product – we should iterate as we learn more, and gathering data is an important part of learning.

Only by having clear estimates in the first place can we identify if we’re hitting our expectations and adapt our approaches to improve accuracy in future iterations.

* Which of our assumptions were right? Which were wrong?
* What changed?
* How can we do better next time?

Over the past couple of decades, gathering this data has allowed me to iterate approaches over many, many projects. From this, I’ve gathered my own set of beliefs that I share with my teams and I will share with you now. Nothing is set in stone, but they may be useful for your teams as you try to improve accuracy.

#### Rod’s strongly-held beliefs

* Estimates should be in half-day increments from 0.5–2 days.
  * Any attempts to plan more granularly than a half-day unit is probably over-optimization. If tasks are smaller than half a day, group them together into a half-day chunk.
  * If tasks are bigger than two days, then break them apart. Tasks that are bigger than two days suggest to me that not enough thinking has gone into specifically what actions need to take place to complete the task.
* Engineers’ planned time should __never__ add up to 100% of the sprint time. Things like meetings, interviews, code review, on-call alerts, or vacation (which will vary per engineer per sprint) should be planned around.
* Estimates are only trustworthy if they’re confirmed by the engineer who will be doing the task.
* Any bug that is planned on being worked in a sprint should be estimated and included in the sprint tasks. (Bugs that aren’t planned on being worked on, or which will be picked up opportunistically by on-call, don’t need to be in sprint plans.)
* Retrospectives at the end of the sprint are required. How they are run can vary – there are lots of good formats and techniques. Experiment and try different ones!
* For tasks that slip, it’s important in retrospection to determine those that we were powerless to avoid (e.g. an engineer fell ill) vs. those that we had, or could have had, the information to avoid (e.g. forgot about a half-day team off-site when planning).

### So going back to [those people](https://www.quora.com/Why-are-software-development-task-estimations-regularly-off-by-a-factor-of-2-3/answer/Michael-Wolfe?share=1) heading to Los Angeles…

Imagine if they’d shown their first set of estimates to a peer.

* ‘What makes you think you can walk at 4 miles per hour?’ would be the simple question.
* ‘The last team who tried this ended up renting a car.’ would be an experienced mentor’s advice.
* ‘Have you heard of Mandelbrot’s [Coastline Paradox](https://en.wikipedia.org/wiki/Coastline_paradox)?’ would be the [Galaxy Brain](https://knowyourmeme.com/memes/galaxy-brain) response.

Any of which could have saved them before they laced their walking shoes!

---
_This article was originally posted on [LeadDev.com](https://leaddev.com/productivity-eng-velocity/estimating-your-way-success) and edited by Ellie Spencer-Failes._