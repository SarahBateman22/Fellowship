'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Baking', 'Dairy', 'Miscellaneous', 'Produce', 'Protein', 'Snacks'].sort();

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      const data = doc.data();
      if (data.name && data.category) {
        inventoryList.push({ id: doc.id, ...data });
      }
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async () => {
    if (!itemName || !itemCategory) {
      console.error("Missing item name or category");
      return;
    }
    try {
      const itemKey = itemName.trim().toLowerCase();
      const categoryKey = itemCategory.trim().toLowerCase();
      const existingDoc = inventory.find(doc => 
        doc.name.toLowerCase() === itemKey && doc.category.toLowerCase() === categoryKey
      );
      
      if (existingDoc) {
        const docRef = doc(firestore, 'inventory', existingDoc.id);
        await setDoc(docRef, { quantity: existingDoc.quantity + 1 }, { merge: true });
      } else {
        const newDocRef = doc(collection(firestore, 'inventory'));
        await setDoc(newDocRef, { name: itemName, category: itemCategory, quantity: 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(firestore, 'inventory', id));
    await updateInventory();
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inventoryByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredInventory.filter(item =>
      item.category.toLowerCase() === category.toLowerCase()
    );
    return acc;
  }, {});

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Typography variant="h4" style={{ marginTop: 20, fontWeight: 'bold' }}>
        Pantry Tracker
      </Typography>
      <TextField
        label="Search Items"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: 20, marginBottom: 20 }}
      />
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add New Item
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <TextField
            id="item-name"
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{ marginBottom: 20 }}
          />
          <FormControl fullWidth style={{ marginBottom: 20 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={itemCategory}
              label="Category"
              onChange={(e) => setItemCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              addItem();
              setItemName('');
              setItemCategory('');
              setOpen(false);
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
      {categories.map((category) => (
        inventoryByCategory[category].length > 0 && (
          <Box key={category} sx={{ mt: 2, width: '90%' }}>
            <Typography variant="h5" gutterBottom>
              {category}
            </Typography>
            <Stack spacing={2}>
              {inventoryByCategory[category].map(item => (
                <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 2, bgcolor: '#f0f0f0' }}>
                  <Typography>{item.name}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Button variant="contained" color="error" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
        )
      ))}
    </Box>
  );
}

