---
title: Tuning the swing
date: 2026-11-05
summary: Longer swings, a turn cap, and why both make sword fights easier to read.
---

This week has been all about how a sword fight *feels*. No new features, just tuning: change a number, play,
change it again.

## How a swing works

Every swing in Black Tallow has three parts:

- **The wind-up.** You draw the weapon back. This is the tell: your opponent can see which way the blow is
  coming and get their guard up on that side.
- **The release.** The blade is moving and can hit. Once it starts, you're committed.
- **The recovery.** You bring the weapon back under control, and you're open while you do.

The combat is directional. You pick the angle of each swing with the mouse, and blocks work by direction too,
so reading your opponent's wind-up matters.

## Drags and accels

While the blade is moving, turning your view carries the swing with you. That gives you two tricks:

- **A drag** is turning *against* the swing, so the blade reaches the target later than your opponent
  expects, and their block goes up too early.
- **An accel** (short for accelerate) is turning *into* the swing, so it lands sooner than they expect.

The wind-up tells your opponent *where* the blow is coming from. A drag or an accel plays with *when*. That's
most of the mind games in a fight.

## Longer releases

The first problem: on most weapons the release was too quick for drags and accels to mean much. With the
longsword, the blade was meeting the training dummy within about a tenth of a second of the release starting,
so even a hard turn barely changed when it landed.

So the longsword's release went from 235 milliseconds (thousandths of a second) to 425. Push it to 500 or
600 and it starts to look floaty, as if the sword is moving through water. The rest of the weapons were
scaled up from the longsword, with the heaviest, like the maul, topping out around 600. Heavy weapons are
slower, but they still feel like they're cutting through air.

## The turn cap

Longer releases brought a new problem. With a fast enough flick of the mouse, a drag could whip the blade
right past the target and miss completely. And how far you could drag depended on your mouse settings as
much as your skill.

The fix is a **turn cap**: while the blade is moving, your view can only turn so fast. Each weapon has its
own cap, worked out so that turning at the cap for the whole release carries the blade through the end of its
arc, and no further. The longsword's is about half a turn a second; a dagger can turn nearly twice as fast,
and a maul a fair bit slower.

Why does that help so much?

- **Drags and accels are readable.** The hardest drag or accel changes the blade's speed by about half,
  slower or faster, and no more. When you're defending, you're making a read, not a guess.
- **A full drag still lands.** You can commit to one without wondering if it'll sail past.
- **Everyone has the same limits**, whatever their mouse sensitivity.
- **Weapons feel different.** A quick blade can twist mid-swing; a heavy one can't.

Of everything this week, the turn cap made the biggest difference.

It also let me remove something. There used to be a safety net for very fast turns, a "glance", where a blow
landed while turning too fast did almost no damage. In play it just felt like the hit hadn't happened, and
with the cap in place there's no need for it, so it's gone.

## Fewer accidental changes of mind

During the wind-up, a quick flick of the mouse lets you change your mind about a swing's direction, say from
a side swing to an overhead. It's useful, but it kept catching me out: I'd start turning early to set up a
drag, and the game would read that as a flick and change my swing.

Now the swing's direction locks in earlier, 40% of the way through the wind-up instead of 60%. Turning
after that point just sets up your drag.

## Next: hit stop

Next up is **hit stop**: the split-second pause when a blow connects. It's a tiny thing, but it's a big part
of what makes a hit feel heavy instead of like a blade passing through smoke. Right now it's set weapon by
weapon with no rule behind it (the maul's is actually shorter than the longsword's), and none of it feels
weighty enough.

The new rule: the more damage a hit does, the longer the stop. Every stop plays as a sudden slow-motion
rather than a dead freeze. The person or monster you hit freezes along with you, so their flinch lands with
your blow, and the little kick the camera gives on a hit follows the stop.

There's a multiplayer wrinkle too. Every hit is decided by the **server**: the computer running the game for
everyone in the session, which has the final say so that nobody can cheat. When you're playing over the
internet, the news that your hit landed takes a moment to come back from the server, so you might feel the
stop late, or not at all. The fix is for your own computer to show the stop the instant your blade connects,
and let the server confirm it.
