int ledRumena= 6;
int ledRdeca = 5;
int tipka1 = 2;
int tipka2 = 4;
int stikalo = 3; 

bool on = false;

void setup() {
  pinMode(ledRumena, OUTPUT);
  pinMode(ledRdeca, OUTPUT);
  pinMode(tipka1, INPUT);
  pinMode(tipka2,INPUT);
  pinMode(stikalo, INPUT);
}

void loop() {
  //digitalWrite(ledRumena, LOW);
  //digitalWrite(ledRdeca, LOW);

  if (digitalRead(tipka1)==HIGH){
    on=true;
  }
  if(digitalRead(tipka2)==HIGH){
    on=false;
  }
  delay(50);
  if (digitalRead(stikalo)==HIGH){
    digitalWrite(ledRdeca,LOW);
    if (on){
      digitalWrite(ledRumena, HIGH);
      delay(500);
      digitalWrite(ledRumena, LOW);
      delay(500);
    }else{
      digitalWrite(ledRumena,LOW);
    }
  }else{
    digitalWrite(ledRumena,LOW);
    digitalWrite(ledRdeca,HIGH);
  }
}
