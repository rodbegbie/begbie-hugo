---
title: "Hypothesis-driven development"
date: 2020-08-20T12:49:27+06:00
featureImage: images/allpost/allPost-7.jpg
postImage: images/single-blog/feature-image.jpg
---


_If you’ve ever worked on a project for months, quarters, or years, only to see underwhelming results when it finally launches, maybe it’s time to reach into the scientific process for a new approach to problem-solving…_

---

When proposing new engineering projects, it’s tempting to talk in absolutes: to paint the picture of a successful future where happy customers are living their best lives thanks to the completion of our initiative.

But no matter the brilliance of our team, none of us can be 100% sure of the future. If we were, we’d be off buying lottery tickets, not designing database sharding systems. And so it can be helpful to have a way to track our progress over the course of a project, checking that our assumptions and beliefs aren’t being held incorrectly in the face of actual user or system behaviour.

Hypotheses sound like great things. Just the word “hypothesis” - it’s so freakin’ science-y! But often we take our success criteria, call them our hypotheses (‘if we reduce build times, engineers will be happier and more productive’), and start building. It’s my experience that defining and stating good hypotheses at the beginning of design, and measuring the success through a process of incremental, phased development, results in spending less time building systems that are ineffective, and more time learning and understanding our customers.

---

## What makes a good hypothesis?

I spent several years leading a product growth team that ran a lot of experiments. That seems like a somewhat obvious statement as the most conspicuous impression of the work of growth teams is ‘you run an a/b test on something, then ship the side that wins’.

However, we ran into some interesting challenges when we were building experiments. In some cases, we would build and run an experiment and see statistically-significant results. But then when the time came to ship, disagreement would break out about whether this result was a “win” or not. If our experiment increased the number of new users trying our service, but they convert to paying customers at a lower rate than average, should we continue to invest in this area, or move onto something new?  It was frustrating that we only really had those conversations *after* the design, build, and execution of an experiment.

At one point, a teammate shared a [blog post by a product manager at Patreon](https://medium.com/@talraviv/thats-not-a-hypothesis-25666b01d5b4) which I highly recommend.  To quote a couple of key paragraphs:

> **A good hypothesis is a statement about what you believe to be true today.** It is not what you think will happen when you try X. It contains neither the words “If” nor “Then.” In fact, it has nothing to do with what you’re about to try — it’s all about your users.
> 
> Why be pedantic about this? Because hypotheses are the key to learning. Product growth doesn’t happen from a few cool tricks. Product growth comes from fumbling around in the dark, trying a lot of things, and improving our aim over the course of months and years. In other words, this is a long game that is ultimately about learning. **Clear learnings come only from clear hypotheses.**

---

## Setting hypotheses

Defining the hypotheses in the form of ‘we believe *X* because *Y*’ is a crucial act of framing. It sets the stage for the work to be done. In most cases, we found them to be fairly uncontroversial. To give a specific example from my growth team:

> ‘We believe that new users have trouble discovering both basic and advanced functionality because user testing shows that much of it is hidden from discovery and not mentioned during normal use of the product.’

The hypothesis is clear and backed up with evidence. The goal with a hypothesis is that anyone reviewing can give feedback on whether or not they buy into this statement. There’s nothing here about priority, urgency or what we might build; it’s a statement of belief.

Sometimes we didn’t have strong evidence or pointers to feedback, but we believed something in our guts. That’s OK too. Stating the hypothesis allows it to be challenged and tested. When we were planning our Sprints, a loosely-held belief might get more pushback from the team or our leadership, but this allowed us to have those conversations early in the process, rather than once we were already looking at the results of a built experiment.


## Predictions

Once we had our hypotheses, we wrote predictions, and these varied in detail. If we had already run experiments against the hypothesis in previous Sprints and therefore had a higher confidence, our predictions were quite prescriptive. But other times they merely set the goalposts for the team to design towards.

The goal with a prediction is to use it to define the *smallest possible* piece of work that could be built and produce a learning. If a prediction holds true, the hypothesis lives to fight another day, and we can build its next test with confidence.

Here are a couple of examples of predictions we tested.


#### Hypothesis
> We believe that the clutter of banners and call-outs on the homepage creates a negative impression for new users because of customer feedback on Twitter.
#### Prediction
> If we remove all call-outs and banners, or limit to only a single banner, in a user’s first week we will see an increase in average on 7-day and 30-day usage.


The prediction here is very specific to the hypothesis being tested. Importantly, it doesn’t talk about the *risk* of this change (that removing banners may negatively affect other metrics).  For this experiment we want to learn one thing: does this hypothesis stand scrutiny? And can we use the results to further experiment and iterate on this experience in later Sprints?


#### Hypothesis
> We believe that teams aren’t getting as much value out of our product in a collaborative context because a very high percentage of documents are set to “only me” visibility.
#### Prediction
> If we nudge users to place their docs in shared folders, we can get a higher percentage of docs placed in shared folders.


I think this pairing was interesting because the prediction on its own wouldn’t be an interesting experiment to run. (Yes, of course if you nudge users to do something, they’ll be more likely to do it. Duh!) But paired with the hypothesis, there is a clearer picture of why it matters, and (depending on the results) it gave us guidance to continue experimenting along this line of thinking.

This also illustrates a redefinition of “success” for the team’s work. The prediction is non-prescriptive about what the design of the user experience should be, and there are a variety of experiments that could test this prediction. Quickly learning the validity of the hypothesis with a small experiment gave us valuable data to gain confidence in investing in a more permanent solution.

## What success looks like

Our measure of success as a team soon became ‘building and shipping something in a timely manner that helped us learn more about our users and iterate’. But success doesn't have to mean getting a perfect, long-lived solution that never needs tweaking. Success doesn’t even have to be that we were right with our hypothesis. In fact, some of the most rewarding projects have been the ones where we spent a few weeks building and testing something that completely blew our hypothesis apart, as then my reaction was ‘cool, now we know not to spend any more time going down that path!’

But each experiment’s success helped the team stay focused on the projects that would move our product to deliver our business goals, without over-investing in work that didn’t move the needle.

---

## Taking this beyond growth teams

Since moving on from that growth team, I’ve continued to adapt and evolve this hypothesis/prediction approach and can now apply it to different engineering problems. It turns out that no team suffers from getting people aligned early in a project with short, clear definitions of success. Here are some examples of the framework in different situations.

* If your team is starting a new development of a new product, engineers can build scaled-down, hacky prototypes to test key user behaviours before the team invests in a longer-term roadmap.
* If your team is facing challenges around mobile app stability, you can pinpoint the opportunities for improvement, and prioritize and parallelize different approaches to fixing crashes.
* If your team is attempting to improve website performance, you can test and  measure small, reversible changes on individual pages before you invest in switching bundling tools or building asset optimization flows.

My favourite observation from adopting this approach has been seeing increased participation from all levels of engineers in suggesting potential projects. When we’ve kept discussion focused on ‘what are the simple ways to test the hypotheses?’ it’s easier for more-junior engineers to confidently throw out suggestions.

---

So if you’re in a position where you’re planning future work for your team, I encourage you to take a step back, look at your goals, and ask yourself ‘What are the things we believe, and what are the cheapest ways to test whether those beliefs hold up to scrutiny?’  It’s the way scientists have been working for centuries, and it might help you and your team avoid costly mistakes.
