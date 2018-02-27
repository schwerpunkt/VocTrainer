# VocTrainer

VocTrainer is a client side web based training software to train arbitrary data in column format.

Questions can be answered by clicking on random suggestions including the correct answer or by self-honestly ignoring them and simply type them in the textbox.

![screenshot from 2018-02-22 18-55-39](https://user-images.githubusercontent.com/2730611/36555380-1bb76514-1802-11e8-8a96-2f83ef3defa1.png)

[demo](https://www.philippharb.at/VocTrainer)

## Data Structure

Data can be added via .txt files complying the following format:

```
LABEL1,LABEL2,-LABEL3,LABEL4...
label1type,label2type,label3type,label4type...
data,data,data,data...
data,data,data,data...
data,data,data,data...
...
```

* LABEL# ... can be arbitrary title information
* label#type ... used as identifier. should be ascii. certain label#type specific behavior is currently hardcoded (to e.g. * implement tailord needs of certain alphabets/languages). this integration will become more modular
* data ... data that is 'asked' and 'answered'. special cases are implemented such that e.g. information in (brackets) doesn't have to be written in the textfield to be correct (as well as the above mentioned label#type specific cases)

Data files must have two or more columns and must start with the LABEL# and lable#type line.

A single minus '-' can be placed in front of one LABEL# to make it the default being asked (this can be overruled while training).

## Trainer modalities

If the file contains only two columns suggestions are given along with the textbox.

If more than two columns are present no suggestions are given and each other column needs to be typed.

## Scoring

There are by default 4 question'boxes'. Each time you answer a question correctly the dataset is put into the next box. Each time you answer a question incorrectly its dataset is put back into the first box again. The training is over once all datasets are in the last box.
The score is calculated from how many times you incorrectly answer a question.
All scores are stored in the local storage of your browser.
