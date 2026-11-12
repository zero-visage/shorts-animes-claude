# Bruitages du Short « Les trains trop larges », fabriqués en code (numpy), calés sur les images (30 i/s).
# usage : python outils/son/bruitages.py   -> écrit projet/public/trains/sfx.wav
import numpy as np, wave
SR=48000; DUR=1452/30+0.2; N=int(SR*DUR); out=np.zeros(N)
rng=np.random.default_rng(7)
def F(f): return f/30
def put(sig,t,gain_db):
    i=int(t*SR); g=10**(gain_db/20); e=min(N,i+len(sig)); out[i:e]+=sig[:e-i]*g
def env(n,a=0.005,r=0.1):
    t=np.arange(n)/SR; d=n/SR
    return np.clip(t/a,0,1)*np.clip((d-t)/r,0,1)
def noise(d): return rng.standard_normal(int(d*SR))
def lp(x,k):  # one-pole lowpass, k in 0..1
    y=np.empty_like(x); a=0.0
    for i,v in enumerate(x): a+=k*(v-a); y[i]=a
    return y
def bp(x,lo,hi): return lp(x,hi)-lp(x,lo)
def norm(x): return x/ (np.max(np.abs(x))+1e-9)
# ---- building blocks ----
def rumble(d,click=True):
    n=int(d*SR); t=np.arange(n)/SR
    x=lp(noise(d),0.02)*3+0.4*np.sin(2*np.pi*42*t)
    if click:  # wheel clacks on rail joints
        for c in np.arange(0.15,d,0.42):
            for dc in (0,0.07):
                i=int((c+dc)*SR); m=min(n,i+1500); x[i:m]+=lp(noise(0.04)[:m-i],0.3)*np.exp(-np.arange(m-i)/250)*2
    return norm(x)*env(n,0.3,0.6)
def squeal(d,f0=2600):
    n=int(d*SR); t=np.arange(n)/SR
    f=f0+120*np.sin(2*np.pi*5*t)
    x=np.sin(2*np.pi*np.cumsum(f)/SR)+0.4*np.sin(2*np.pi*np.cumsum(f*1.5)/SR)
    return norm(x*env(n,0.08,0.3))
def jack(d):
    n=int(d*SR); t=np.arange(n)/SR
    hits=(np.sin(2*np.pi*22*t)>0.3).astype(float)
    x=bp(noise(d),0.05,0.5)*hits+0.5*np.sin(2*np.pi*90*t)*hits
    return norm(x)*env(n,0.01,0.05)
def crash():
    d=1.2; n=int(d*SR); t=np.arange(n)/SR
    body=lp(noise(d),0.08)*np.exp(-t/0.25)*2+np.sin(2*np.pi*55*t)*np.exp(-t/0.3)
    metal=sum(np.sin(2*np.pi*f*t)*np.exp(-t/0.35) for f in (523,817,1290,2110))*0.25
    return norm(body+metal+bp(noise(d),0.2,0.9)*np.exp(-t/0.12))
def pop(f=900):
    d=0.12; n=int(d*SR); t=np.arange(n)/SR
    fr=f*np.exp(-t*12)+f*0.5
    return norm(np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t/0.035))
def whoosh(d=0.45):
    n=int(d*SR); t=np.arange(n)/SR; sh=np.sin(np.pi*t/d)**2
    x=bp(noise(d),0.03,0.25)*sh
    return norm(x)
def tinkle():
    d=0.6; n=int(d*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for k,f in enumerate((2093,2637,3136,4186)):
        i=int(k*0.06*SR); tt=t[:n-i]; x[i:]+=np.sin(2*np.pi*f*tt)*np.exp(-tt/0.12)
    return norm(x)
def ding():  # cash register
    d=0.9; t=np.arange(int(d*SR))/SR
    x=sum(np.sin(2*np.pi*f*t)*np.exp(-t/0.4) for f in (1568,2349,3136))
    return norm(x)
def thud():
    d=0.5; t=np.arange(int(d*SR))/SR
    return norm(np.sin(2*np.pi*70*t*np.exp(-t*3))*np.exp(-t/0.12)+lp(noise(d),0.1)*np.exp(-t/0.05))
def paper():
    d=0.35; t=np.arange(int(d*SR))/SR
    return norm(bp(noise(d),0.2,0.8)*(np.sin(np.pi*t/d)**2)*(0.6+0.4*np.sin(2*np.pi*31*t)))
# ---- placement (frames from story.ts) ----
W=lambda s: round(s*30)-2
put(rumble(2.2),0.0,-16); put(squeal(1.1),1.0,-28)
put(jack(1.9),F(W(2.57)),-19)
put(whoosh(),F(362)-0.25,-22); put(whoosh(),F(504)-0.25,-22); put(whoosh(),F(670)-0.25,-22)
put(whoosh(),F(746)-0.25,-22); put(whoosh(),F(890)-0.25,-22); put(whoosh(),F(1038)-0.25,-22); put(whoosh(),F(1164)-0.25,-24)
put(pop(700),F(W(4.88)),-17)                       # 2014 sign
put(rumble(3.4,False),F(260),-22)
put(tinkle(),F(W(9.03)),-22); put(tinkle(),F(W(9.8)),-24)
put(pop(500),F(W(11.55)),-17)                      # width arrow
put(paper(),F(W(13.06)),-18)                       # plans
put(pop(1200),F(W(15.24)),-16)                     # turns white
for k in range(16): put(pop(1400),F(468+2*k),-27)  # map dots
put(rumble(0.7),F(504),-17); put(squeal(0.5,2900),F(510),-28)
put(crash(),F(W(17.37)+4),-10)                     # CRAC
put(pop(800),F(W(19.3)),-18)                       # question mark
put(paper(),F(W(23.01)-4),-19); put(pop(600),F(W(24.02)),-18)
put(pop(500),F(W(27.85)),-18); put(whoosh(0.3),F(W(29.02)-6),-20); put(pop(400),F(W(29.02)+14),-17)
put(pop(1000),F(W(32.28)),-17)                     # check
put(thud(),F(W(33.84)),-12)                        # sofa jams
for x0 in range(6): put(jack(4.2),F(1038)+x0*0.05,-24)
put(pop(450),F(W(36.62)),-15)
put(rumble(5.0),F(1164),-21); put(tinkle(),F(W(40.48)),-21)
put(paper(),F(W(44.22)),-17); put(ding(),F(W(45.24)),-15)
put(pop(1300),F(W(46.93)+10),-19)
out=np.tanh(out*1.2)/1.2
pcm=(np.clip(out,-1,1)*32767).astype(np.int16)
import sys, os
SORTIE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'projet', 'public', 'trains', 'sfx.wav')
os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
with wave.open(SORTIE,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok',DUR)
