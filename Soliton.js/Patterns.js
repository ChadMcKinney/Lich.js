
/* 
    Lich.js - JavaScript audio framework
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	LICENSE
	=======

	Licensed under the Simplified BSD License:

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met: 

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer. 
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution. 

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

	The views and conclusions contained in the software and documentation are those
	of the authors and should not be interpreted as representing official policies, 
	either expressed or implied, of the FreeBSD Project.
*/

Soliton = {};
Soliton.synthDefs = {};
Soliton.pbinds = {};

//var _startDate = new Date();
//var _startSeconds = _date.

function _currentTime()
{
	var t = process.hrtime();
	return t[0] + (t[1] * 1e-09);
}

var _initialStartTime = _currentTime();

Soliton.PercStream = function(_events, _modifiers)
{
	var events = _events;
	var modifiers = _modifiers;
	this.nextTime = 0;
	// this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
	var macroBeat = 0;
	var infiniteBeat = 0;
	var modifierBeat = 0;
	var hasModifiers = modifiers.length > 0;
	this._lichType = IMPSTREAM;
	var playing = false;
	var ll = events.length;
	var lm = 1 / ll;

	// Push to the next metric down beat
	// this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;

	
	//Lich.post("NextTime = " + this.nextTime);
	//Lich.post("events = " + Lich.VM.PrettyPrint(events));
	//Lich.VM.Print(modifiers);

	this.stop = function(doRemove)
	{
		doRemove = typeof doRemove === "undefined" ? true : doRemove;
		playing = false;
		
		if(doRemove)
			Lich.scheduler.removeScheduledEvent(this);
	}

	this.play = function()
	{
		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			// Push to the next metric down beat
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
			playing = true;
			Lich.scheduler.addScheduledEvent(this);
		}
	}

	this.subSchedulePlay = function(nevent, nDuration, offset)
	{
		if(nevent instanceof Array)
		{
			if(nevent.length > 0)
			{
				var divDuration = nDuration / nevent.length;
				for(var i = 0; i < nevent.length; ++i)
				{
					this.subSchedulePlay(nevent[i], divDuration, offset + (divDuration * i));
				}
			}
		}

		else if(nevent != Lich.VM.Nothing)
		{
			try
			{				
				var synth;

				if(nevent._datatype === "Pattern")
				{
					var wt = wrapRange(0, ll, infiniteBeat);
					nevent = nevent.p((infiniteBeat - wt) * lm);
				}

				if(typeof nevent === "string")
					synth = Soliton.synthDefs[nevent]();
				else
					synth = nevent();
				
				/* RESTORE FOR WEB AUDIO VERSION
				if(synth._lichType == AUDIO)
				{
					synth.connect(Soliton.masterGain);
					synth.startAll(this.nextTime + offset);
				}*/
			}

			catch(e)
			{
				Lich.post(e);
			}
		}
	}

	this.schedulePlay = function()
	{
		var event = events[macroBeat];
		var beatDuration = Lich.scheduler.tempoSeconds;
		
		if(++macroBeat >= events.length)
				macroBeat = 0;

		++infiniteBeat;

		if(hasModifiers)
		{
			var modifier = modifiers[modifierBeat];

			if(modifier != Lich.VM.Nothing)
			{
				try
				{
					if(modifier._datatype === "Pattern")
						beatDuration = modifier.p(infiniteBeat)(Lich.scheduler.tempoSeconds);
					else
						beatDuration = modifier(Lich.scheduler.tempoSeconds);
				}

				catch(e)
				{
					Lich.post(e);
				}
			}

			if(++modifierBeat >= modifiers.length)
					modifierBeat = 0;
		}
		
		this.subSchedulePlay(event, beatDuration, 0); // recursively schedule beat, adjusting for tuple nesting
		this.nextTime += beatDuration;

		//Lich.post("PercStream nextTime = " + this.nextTime);
		//Lich.post("_currentTime() = " + _currentTime());
		return this.nextTime;
	}

	this.update = function(newEvents, newModifiers)
	{
		events = newEvents;
		modifiers = newModifiers;
		macroBeat = macroBeat % events.length;
		ll = events.length;
		lm = 1 / ll;

		if(modifiers.length)
			modifierBeat = modifierBeat % modifiers.length;
		else
			modifierBeat = 0;

		hasModifiers = modifiers.length > 0;

		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
		}

		this.play();
	}
}

Soliton.SoloStream = function(_instrument, _events, _modifiers, _rmodifiers)
{
	if(!Soliton.synthDefs.hasOwnProperty(_instrument))
		throw new Error("instrument undefined in solo pattern: " + _instrument);

	var instrument = _instrument;
	var events = _events;
	var modifiers = _modifiers;
	var rmodifiers = _rmodifiers;
	this.nextTime = 0;
	//this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
	var macroBeat = 0;
	var infiniteBeat = 0;
	var modifierBeat = 0;
	var hasModifiers = modifiers.length > 0;
	this._lichType = SOLOSTREAM;
	var playing = false;
	var ll = events.length;
	var lm = 1 / ll;

	// Push to the next metric down beat
	//this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;

	
	//Lich.post("NextTime = " + this.nextTime);
	//Lich.post("events = " + Lich.VM.PrettyPrint(events));
	//Lich.VM.Print(modifiers);

	this.stop = function(doRemove)
	{
		doRemove = typeof doRemove === "undefined" ? true : doRemove;
		playing = false;
		
		if(doRemove)
			Lich.scheduler.removeScheduledEvent(this);
	}

	this.play = function()
	{
		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			// Push to the next metric down beat
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
			playing = true;
			Lich.scheduler.addScheduledEvent(this);
		}
	}

	this.subSchedulePlay = function(nevent, nDuration, offset)
	{
		if(nevent instanceof Array)
		{
			if(nevent.length > 0)
			{
				var divDuration = nDuration / nevent.length;
				for(var i = 0; i < nevent.length; ++i)
				{
					this.subSchedulePlay(nevent[i], divDuration, offset + (divDuration * i));
				}
			}
		}

		else if(nevent != Lich.VM.Nothing)
		{
			try
			{
				if(nevent._datatype === "Pattern")
				{
					var wt = wrapRange(0, ll, infiniteBeat);
					nevent = nevent.p((infiniteBeat - wt) * lm);
				}

				if(hasModifiers)
				{
					var modifier = modifiers[modifierBeat];

					if(modifier != Lich.VM.Nothing)
					{
						if(modifier._datatype === "Pattern")
							nevent = modifier.p(infiniteBeat)(nevent);
						else
							nevent = modifier(nevent);
					}
				}

				
				var synth = Soliton.synthDefs[instrument](nevent);

				/* Restore for Web Audio version
				if(synth._lichType == AUDIO)
				{
					synth.connect(Soliton.masterGain);
					synth.startAll(this.nextTime + offset);
				}*/
			}

			catch(e)
			{
				Lich.post(e);
			}
		}
	}

	this.schedulePlay = function()
	{
		var event = events[macroBeat];
		var beatDuration = Lich.scheduler.tempoSeconds;
		
		if(++macroBeat >= events.length)
				macroBeat = 0;

		

		if(rmodifiers.length > 0)
		{
			var rmodifier = rmodifiers[infiniteBeat % rmodifiers.length];

			if(rmodifier != Lich.VM.Nothing)
			{
				try
				{
					if(rmodifier._datatype === "Pattern")
						beatDuration = rmodifier.p(infiniteBeat)(Lich.scheduler.tempoSeconds);
					else
						beatDuration = rmodifier(Lich.scheduler.tempoSeconds);
				}

				catch(e)
				{
					Lich.post(e);
				}
			}
		}
		
		this.subSchedulePlay(event, beatDuration, 0); // recursively schedule beat, adjusting for tuple nesting
		this.nextTime += beatDuration;
		++infiniteBeat;

		if(hasModifiers)
		{
			if(++modifierBeat >= modifiers.length)
					modifierBeat = 0;
		}

		//Lich.post("PercStream nextTime = " + this.nextTime);
		//Lich.post("_currentTime() = " + _currentTime());
		return this.nextTime;
	}

	this.update = function(newInstrument, newEvents, newModifiers, newRModifers)
	{
		if(!Soliton.synthDefs.hasOwnProperty(newInstrument))
			throw new Error("instrument undefined in solo pattern: " + Lich.VM.PrettyPrint(newInstrument));

		instrument = newInstrument;
		events = newEvents;
		modifiers = newModifiers;
		rmodifiers = newRModifers;
	    macroBeat = macroBeat % events.length;
	    ll = events.length;
		lm = 1 / ll;

		if(modifiers.length)
			modifierBeat = modifierBeat % modifiers.length;
		else
			modifierBeat = 0;

		hasModifiers = modifiers.length > 0;

		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
		}

		this.play();
	}
}

Soliton.pbind = function(patternName, func, _arguments, duration)
{
	this.patternName = patternName;
	this.func = func;
	this.args = _arguments;
	this.duration = duration;
	var beatDuration = 0;
	this.value = null;
	// this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
	var infiniteBeat = 0;
	this._lichType = SOLOSTREAM;
	var playing = false;

	this.stop = function(doRemove)
	{
		doRemove = typeof doRemove === "undefined" ? true : doRemove;
		playing = false;
		
		if(doRemove)
			Lich.scheduler.removeScheduledEvent(this);
	}

	this.play = function()
	{
		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			playing = true;
			Lich.scheduler.addScheduledEvent(this);
		}
	}

	this.schedulePlay = function()
	{
		try
		{
			beatDuration = this.duration;

			if(beatDuration._datatype === "Pattern")
				beatDuration = Lich.scheduler.tempoSeconds * beatDuration.p(infiniteBeat);
			else
				beatDuration *= Lich.scheduler.tempoSeconds;

			var currentValue = this.func;

			if(currentValue._datatype === "Pattern")
				currentValue = currentValue.p(infiniteBeat);

			var args = null;
			if(this.args instanceof Array)
			{
				args = [];
				for(var i = 0; i < this.args.length; ++i)
				{
					var arg = this.args[i];

					if(arg._datatype === "Pattern")
						arg = arg.p(infiniteBeat);

					args.push(arg);
				}
			}

			else
			{
				if(this.args._datatype === "Pattern")
					args = [this.args.p(infiniteBeat)];
				else
					args = [this.args];
			}
			
			var synth = currentValue;
			
			if(typeof synth === "string")		
				synth = Soliton.synthDefs[currentValue];

			if(typeof synth === "function")
				synth = synth.curry.apply(synth, args);

			this.value = synth;

			/* Restore for Web Audio Version
			if(synth._lichType == AUDIO)
			{
				synth.connect(Soliton.masterGain);
				synth.startAll(this.nextTime);
			}*/

			++infiniteBeat;
		}

		catch(e)
		{
			Lich.post(e);
		}
		
		this.nextTime += beatDuration;
		return this.nextTime;
	}

	this.update = function(func, _arguments, duration)
	{
		this.func = func;
		this.args = _arguments;
		this.duration = duration;

		if(!playing)
		{
			this.nextTime = Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			//this.nextTime += (this.nextTime / Lich.scheduler.tempoSeconds) * Lich.scheduler.tempoSeconds;
		}

		this.play();
	}
}

function pbind(patternName, func, args, duration)
{
	var p = null;

	if(Soliton.pbinds.hasOwnProperty(patternName))
	{
		Soliton.pbinds[patternName].update(func, args, duration);
		p = Soliton.pbinds[patternName];
	}

	else
	{
		p = new Soliton.pbind(patternName, func, args, duration);
		Soliton.pbinds[patternName] = p;
		p.play();
	}

	return p;
}

Soliton.SteadyScheduler = function()
{
	this.tempo = 280; // bpm
	this.tempoSeconds = (60 / this.tempo); 
	this.tempoMillis = this.tempoSeconds * 1000;
	tempo = this.tempo;
	tempoSeconds = this.tempoSeconds;
	tempoMillis = this.tempoMillis;
	var playing = false;
	var startTime = null;
	var lookAhead = 25; // How frequently to call scheduling, in milliseconds
	var scheduleAhead = 0.1; // How far ahead to actually schedule events, in seconds
	 // We use 2 queues and a temporary variable to efficiently filter called events by swapping variables, only using push, 
	 // and reassining currentQueue.length = 0
	var currentQueue = [];
	var nextQueue = [];
	var tempQueue = null;
	var timerID = null;
	var requiresSchedule = 0;
	var nextTime = 0;

	this.scheduleEvent = function(event)
	{
		try
		{
			nextTime = event.schedulePlay();
		}

		catch(e)
		{
			Lich.post(e);
		}

		// Schedule all events that fall within our requiresSchedule range.
		while(nextTime != null)
		{
			if(nextTime < requiresSchedule)
				nextTime = event.schedulePlay();
			else
				break;
		}

		// If nextTime still isn't null, reschedule the event for visitation in our scheduler's nextQueue
		if(nextTime != null/* && typeof nextTime == "number"*/)
			nextQueue.push(event);
	}

	this.visitScheduledEvents = function()
	{
		// requiresSchedule ss the current time + the schedule ahead time. 
		// This allows us to reduce jitter while still being reactive to pattern and tempo changes.
		requiresSchedule = _currentTime() + scheduleAhead;
		//Lich.post("Requires schedule = " + requiresSchedule);
		for(var i = 0; i < currentQueue.length; ++i)
		{
			// If the event time is within our barrier for look ahead time, then we schedule the audio event.
			if(currentQueue[i].nextTime < requiresSchedule)
			{
				Lich.scheduler.scheduleEvent(currentQueue[i]);
			}

			// Otherwise we push the event into the nextQueue for future evaluation.
			else
			{
				nextQueue.push(currentQueue[i]);
			}
		}

		currentQueue.length = 0; // Reassign length of the currentQueue so we can keep using push on the next visitScheduledEvents run
		//// Here we swap the current and next queues, using a temporary variable. ////
		tempQueue = currentQueue; // store the current Queue in a temporary variable for swapping
		currentQueue = nextQueue; // Swap current queue with the next Queue
		nextQueue = tempQueue; // swap the next queue with the previous current Queue, stored in the temporary variable.

		// Reschedule visitScheduledEvents, keeping track of the ID for stopping/pausing.
		// timerID = setTimeout(Lich.scheduler.visitScheduledEvents, lookAhead);
		timerID = setTimeout(Lich.scheduler.visitScheduledEvents, 0);
	}

	this.start = function()
	{
		if(!playing)
		{
			playing = true;
			Lich.scheduler.visitScheduledEvents();
		}
	}

	this.pause = function()
	{
		if(playing)
		{
			playing = false;
			clearTimeout(timerID);
		}
	}

	this.stop = function()
	{
		playing = false;
		clearTimeout(timerID);

		for(var i = 0; i < currentQueue.length; ++i)
		{
			currentQueue[i].stop(false);
		}
		
		for(var i = 0; i < nextQueue.length; ++i)
		{
			nextQueue[i].stop(false);
		}

		for(var i = 0; i < tempQueue.length; ++i)
		{
			tempQueue[i].stop(false);
		}

		currentQueue = [];
		nextQueue = [];
		tempQueue = null;
		timerID = null;
	}

	this.freeScheduledEvents = function()
	{
		for(var i = 0; i < currentQueue.length; ++i)
		{
			var elem = currentQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop(false);
		}
		
		for(var i = 0; i < nextQueue.length; ++i)
		{
			var elem = nextQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop(false);
		}

		for(var i = 0; i < tempQueue.length; ++i)
		{
			var elem = tempQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop(false);
		}

		currentQueue = [];
		nextQueue = [];
		tempQueue = null;
	}

	this.addScheduledEvent = function(event)
	{
		currentQueue.push(event);
	}

	this.removeScheduledEvent = function(event)
	{
		var currentIndex = currentQueue.indexOf(event);
		if(currentIndex != -1)
			currentQueue.splice(currentIndex, 1);
	}

	this.setTempo = function(bpm)
	{
		Lich.scheduler.tempo = bpm;
		Lich.scheduler.tempoSeconds = (60 / Lich.scheduler.tempo); 
		Lich.scheduler.tempoMillis = Lich.scheduler.tempoSeconds * 1000;
		tempo = bpm;
		tempoSeconds = Lich.scheduler.tempoSeconds;
		tempoMillis = Lich.scheduler.tempoMillis;
	}
}

function currentBeat()
{
	return Math.floor((_currentTime() / Lich.scheduler.tempoSeconds) + 0.5);
}

Lich.scheduler = new Soliton.SteadyScheduler();
Lich.scheduler.start();
