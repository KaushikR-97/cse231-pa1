1) Python Programs that make use of binary operators that are used in PA1 but have a different behaviour are:

i) + operator used for string concatenation:
x = 'a'
y = 'b'
z = x + y
print(z).
This is a ParseError in our grammar but works well in Python.
This can be implemented by determining if the value is a number or not. If its not a number then take it as a string and concatenate them.

ii) - operator used for set subtraction.
x = {1,2,3}
y = {3,4,5}
print(x - y)
This will throw a ParseError in our implementation but works correctly in Python.
This can be done the same way as the above one.Determine the type of the value and if its not a number as is an array or set, then just delete the elements of the second array present in the first array.

iii) max and min operators can take in muliple parameters other than 2.
 max(2,5,9) is allowed in Python whereas it is a ParseError in our code.
This can be done by allowing more than 2 operands in the ast files for such kind of operations

iv) pow = 6
    pow(pow,pow)
    This works in our implementation but such operations are not allowed in Python.
    We can extend this case by comparing the variable names with the list of key words and exit if they match.

2) TA Videos were very helpful in understanding and submitting the code

3) Did not collaborate with anyone.
